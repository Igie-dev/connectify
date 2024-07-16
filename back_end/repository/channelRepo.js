import prisma from "../utils/prisma.js";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { channelDto, channelsDto, messagesDto } from "../dto/channelDto.js";
dotenv.config();
const messagesLimit = process.env.MESSAGES_LIMIT;

class ChannelRepo {
  //create  channel
  async create({ members, senderId, type, message, channelName }) {
    return new Promise(async (resolve, reject) => {
      try {
        const createChannel = await prisma.channel.create({
          data: {
            channel_id: uuid(),
            channel_name: channelName,
          },
        });
        if (createChannel?.id) {
          for (let member of members) {
            await prisma.channelMember.create({
              data: {
                user_id: member.userId,
                channel_id: createChannel?.channel_id,
                join_approved: true,
                is_admin: member.userId === senderId,
              },
            });
          }
        }
        await prisma.message.create({
          data: {
            message_id: uuid(),
            sender_id: senderId,
            message: message,
            type: type,
            channel_id: createChannel?.channel_id,
          },
        });

        const channel = await this.getByChannelId(createChannel?.channel_id);
        if (!channel?.id) {
          reject(new Error("Something went wrong!"));
          return;
        }

        resolve(channel);
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async getByChannelId(channelId) {
    return new Promise(async (resolve, reject) => {
      try {
        const channel = await prisma.channel.findUnique({
          where: { channel_id: channelId },
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                channel: {
                  include: {
                    members: {
                      where: {
                        join_approved: true,
                      },
                      include: {
                        user: {
                          select: {
                            id: true,
                            user_name: true,
                            email: true,
                            user_id: true,
                            avatar_id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            members: {
              where: {
                join_approved: true,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    user_name: true,
                    email: true,
                    user_id: true,
                    avatar_id: true,
                  },
                },
              },
            },
          },
        });
        if (!channel?.id) {
          reject(new Error("Channel not found"));
          return;
        }
        resolve(channelDto(channel));
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async getUserChannels(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await prisma.user.findUnique({
          where: { user_id: userId },
          include: {
            channels: {
              where: {
                join_approved: true,
              },
              include: {
                channel: {
                  include: {
                    messages: {
                      orderBy: {
                        createdAt: "desc",
                      },
                      take: 1,
                      include: {
                        channel: {
                          include: {
                            members: {
                              where: {
                                join_approved: true,
                              },
                              include: {
                                user: {
                                  select: {
                                    id: true,
                                    user_name: true,
                                    email: true,
                                    user_id: true,
                                    avatar_id: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    members: {
                      where: {
                        join_approved: true,
                      },
                      include: {
                        user: {
                          select: {
                            id: true,
                            user_name: true,
                            email: true,
                            user_id: true,
                            avatar_id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!foundUser?.id) {
          reject(new Error("User not found"));
          return;
        }

        if (foundUser?.channels?.length <= 0) {
          resolve([]);
          return;
        }

        const channels = foundUser?.channels.map((c) => ({
          id: c?.channel?.id,
          channel_id: c?.channel?.channel_id,
          channel_name: c?.channel?.channel_name,
          avatar_id: c?.channel?.avatar_id,
          createdAt: c?.channel?.createdAt,
          updatedAt: c?.channel?.updatedAt,
          messages: c?.channel?.messages,
          members: c?.channel?.members,
        }));

        resolve(channelsDto(channels));
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async deleteChannel({ channelId, userId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await prisma.channelMember.findFirst({
          where: {
            AND: [
              { user_id: userId },
              { channel_id: channelId },
              { join_approved: true },
              { is_admin: true },
            ],
          },
        });
        if (!foundUser?.id) {
          reject(new Error("User not admin"));
          return;
        }

        const channel = await this.getByChannelId(channelId);
        if (!channel?.id) {
          reject(new Error("Channel not found"));
          return;
        }

        //Delete channel if channel is group
        await prisma.channel.delete({
          where: { channel_id: channelId },
        });

        resolve(channelDto(channel));
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async getChannelMessages({ channelId, take, cursor }) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          where: { channel_id: channelId },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
              take: -Number(take),
              include: {
                channel: {
                  include: {
                    members: {
                      where: {
                        join_approved: true,
                      },
                      include: {
                        user: {
                          select: {
                            user_id: true,
                            id: true,
                            user_name: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
                user: {
                  select: {
                    user_id: true,
                    id: true,
                    user_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        };

        if (cursor) {
          query.include.messages.cursor = {
            id: Number(cursor),
          };
          query.include.messages.skip = 1;
        }

        const channel = await prisma.channel.findFirst(query);

        if (!channel?.id) {
          reject(new Error("Channel not found"));
          return;
        }

        const nextCursorId =
          channel.messages?.length >= messagesLimit
            ? channel.messages[0].id
            : null;
        const messages = messagesDto(channel.messages);

        resolve({ messages: messages, cursor: nextCursorId });
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async createNewMessage({ channelId, senderId, message, type }) {
    return new Promise(async (resolve, reject) => {
      try {
        const foundChannel = await prisma.channel.findUnique({
          where: {
            channel_id: channelId,
          },
        });

        if (!foundChannel?.id) {
          reject(new Error("Channel not found"));
          return;
        }
        const saveMessage = await prisma.message.create({
          data: {
            message_id: uuid(),
            channel_id: channelId,
            message,
            type,
            sender_id: senderId,
          },
        });
        if (!saveMessage?.id) {
          reject(new Error("Failed to save message!"));
          return;
        }
        const foundChannelMember = await prisma.channelMember.findMany({
          where: {
            channel_id: channelId,
          },
        });

        if (foundChannelMember?.length >= 1) {
          for await (let member of foundChannelMember) {
            await prisma.channelMember.update({
              where: {
                id: member.id,
              },
              data: {
                is_seen: member.user_id === senderId,
              },
            });
          }
        }

        const channel = await this.getByChannelId(saveMessage?.channel_id);
        if (!channel?.id) {
          reject(new Error("Something went wrong!"));
          return;
        }
        resolve(channel);
      } catch (error) {
        reject(error);
        return;
      }
    });
  }
}

export default new ChannelRepo();
