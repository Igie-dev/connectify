import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";
import { v4 as uuid } from "uuid";
import {
  emitNewMessage,
  emitChangeChannelName,
  emitingRemoveChannelMember,
  emitingSeen,
  emitingDeleteChannel,
  emitingNewChannelMembers,
} from "../socket/socket.js";
import { channelMembersDto, channelMemberDto } from "../dto/channelDto.js";
import channelRepo from "../repository/channelRepo.js";
import userRepo from "../repository/userRepo.js";

const createChannel = asyncHandler(async (req, res) => {
  try {
    const { members, senderId, type, message, channelName } = req.body;

    if (
      members?.lenght <= 1 ||
      !message ||
      !senderId ||
      !type ||
      !channelName
    ) {
      return res.status(400).json({ message: "All field are required!" });
    }

    const channelData = await channelRepo.create({
      members,
      senderId,
      type,
      message,
      channelName,
    });

    for await (let member of members) {
      emitNewMessage(member.userId, channelData);
    }

    return res.status(200).json(channelData);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const userChannels = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const search = req.query.search;

  try {
    const founcUserChannels = await channelRepo.getUserChannels(userId);

    let channels = [];
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      const filterChannels = founcUserChannels?.filter((c) =>
        c.channelName?.toLowerCase().includes(lowercaseSearch)
      );

      channels = filterChannels;
    } else {
      channels = founcUserChannels;
    }

    channels?.sort((a, b) => b.messages[0].createdAt - a.messages[0].createdAt);
    return res.status(200).json(channels);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const getChannel = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  try {
    const channel = await channelRepo.getByChannelId(channelId);
    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const deleteChannel = asyncHandler(async (req, res) => {
  const { channelId, userId } = req.body;
  try {
    if (!channelId || !userId) {
      return res.status(400).json({ message: "All field are required" });
    }

    const channel = await channelRepo.deleteChannel({ channelId, userId });

    for await (let member of channel.members) {
      emitingDeleteChannel(member.userId, {
        channelId: channel.channelId,
        userId: userId,
      });
    }

    return res.status(200).json({ message: "Channel deleted" });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const channelMessages = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const take = JSON.parse(req.query.take);
  const cursor = req.query.cursor;
  try {
    const channel = await channelRepo.getChannelMessages({
      channelId,
      take,
      cursor,
    });

    return res
      .status(200)
      .json({ messages: channel?.messages, cursor: channel?.cursor });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const { senderId, message, type } = req.body;
    if (!channelId || !message || !senderId || !type) {
      return res.status(500).json({ message: "All field are required!" });
    }

    const channel = await channelRepo.createNewMessage({
      channelId,
      senderId,
      message,
      type,
    });
    for await (let member of channel?.members) {
      emitNewMessage(member.userId, channel);
    }
    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const removeChannelmember = asyncHandler(async (req, res) => {
  try {
    const { channelId, userId, type } = req.body;
    if (!channelId || !userId) {
      return res.status(400).json({ message: "All field are required!" });
    }

    const foundChannel = await channelRepo.getByChannelId(channelId);
    const foundUser = await userRepo.getByUserId(userId);
    const members = foundChannel?.members;
    const admin = members.filter((m) => m.isAdmin);
    const adminId = admin[0]?.userId;

    if (adminId === userId)
      return res
        .status(401)
        .json({ error: `Failed to leave/remove user is admin!` });

    await prisma.channelMember.deleteMany({
      where: {
        AND: [{ channel_id: channelId }, { user_id: userId }],
      },
    });

    await channelRepo.createNewMessage({
      channelId,
      senderId: userId,
      message:
        type === "remove"
          ? `${foundUser?.userName}  was removed by admin!`
          : type === "leave"
          ? `${foundUser?.userName}  left this group!`
          : "",
      type: "notification",
    });

    const channel = await channelRepo.getByChannelId(channelId);

    //If channel has no member
    //Delete tha channel
    if (channel?.members?.length <= 0) {
      await prisma.channel.delete({ where: { channel_id: channelId } });
    }

    emitingRemoveChannelMember(userId, {
      channelId: channel.channelId,
      userId: userId,
    });

    for await (let member of members) {
      emitingRemoveChannelMember(member.userId, {
        channelId: channel.channelId,
        userId: userId,
      });
      if (member.joinApproved) {
        emitNewMessage(member.userId, channel);
      }
    }

    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const seenChannel = asyncHandler(async (req, res) => {
  try {
    const { channelId, userId } = req.body;
    if (!channelId || !userId) {
      return res.status(400).json({ message: "required!" });
    }

    const foundChannelMember = await prisma.channelMember.findMany({
      where: {
        AND: [{ channel_id: channelId }, { user_id: userId }],
      },
    });

    if (foundChannelMember?.length <= 0) {
      return res
        .status(500)
        .json({ message: "Failed to get channel members!" });
    }
    const updateUserSeen = await prisma.channelMember.update({
      where: {
        id: foundChannelMember[0].id,
      },
      data: {
        is_seen: true,
      },
    });
    if (!updateUserSeen?.id) {
      return res.status(500).json({ message: "Failed to update seen!" });
    }

    const channel = await channelRepo.getByChannelId(channelId);

    for await (let member of channel?.members) {
      emitingSeen(member.userId, channel);
    }
    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const changeChannelName = asyncHandler(async (req, res) => {
  try {
    const { channelId, name, userId } = req.body;
    const foundChannel = await prisma.channel.findUnique({
      where: { channel_id: channelId },
    });

    if (!foundChannel?.id) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const updateChannel = await prisma.channel.update({
      where: { channel_id: channelId },
      data: { channel_name: name },
    });
    if (!updateChannel?.id) {
      return res.status(500).json({ message: "Failed to change channel name" });
    }

    const foundUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        user_name: true,
      },
    });

    if (foundUser?.id) {
      await prisma.message.create({
        data: {
          message_id: uuid(),
          sender_id: userId,
          type: "notification",
          channel_id: channelId,
          message: `Channel name was change by ${foundUser?.user_name}`,
        },
      });
    }

    const channel = await channelRepo.getByChannelId(channelId);

    for await (let member of channel.members) {
      emitChangeChannelName(member.userId, {
        channelId: channelId,
        channelName: name,
      });
      emitNewMessage(member.userId, channel);
    }
    return res.status(200).json(channel);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const getChannelMembers = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params.channelId;

    const foundMembers = await prisma.channelMember.findMany({
      where: {
        AND: [{ channel_id: channelId }, { join_approved: true }],
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
    });

    const memberData = channelMembersDto(foundMembers);

    return res.status(200).json(memberData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const getChannelRequestJoin = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params.channelId;

    const foundMembers = await prisma.channelMember.findMany({
      where: {
        AND: [{ channel_id: channelId }, { join_approved: false }],
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
    });

    const memberData = channelMembersDto(foundMembers);

    return res.status(200).json(memberData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const requestJoinChannel = asyncHandler(async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    const requestExist = await prisma.channelMember.findFirst({
      where: {
        AND: [
          { channel_id: channelId },
          { user_id: userId },
          { join_approved: false },
        ],
      },
    });

    if (requestExist?.id) return res.status(200).json({ channelId, userId });

    const alreadyMember = await prisma.channelMember.findFirst({
      where: {
        AND: [
          { channel_id: channelId },
          { user_id: userId },
          { join_approved: true },
        ],
      },
    });

    if (alreadyMember?.id) return res.status(200).json({ channelId, userId });
    const join = await prisma.channelMember.create({
      data: {
        channel_id: channelId,
        user_id: userId,
      },
    });

    if (!join?.id) {
      throw new Error("Failed to join");
    }
    return res.status(200).json({ channelId, userId });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const acceptRequestChannelJoin = asyncHandler(async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    const foundReq = await prisma.channelMember.findFirst({
      where: {
        AND: [{ channel_id: channelId }, { user_id: userId }],
      },
    });
    if (!foundReq?.id) {
      return res.status(404).json({ message: "Request not found!" });
    }
    await prisma.channelMember.updateMany({
      where: {
        AND: [{ channel_id: channelId }, { user_id: userId }],
      },
      data: {
        join_approved: true,
      },
    });

    const foundNewMember = await prisma.user.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        user_name: true,
      },
    });

    if (foundNewMember?.id) {
      await prisma.message.create({
        data: {
          message_id: uuid(),
          sender_id: userId,
          type: "notification",
          channel_id: channelId,
          message: `New user ${foundNewMember?.user_name} was added to channel!`,
        },
      });
    }

    const channel = await channelRepo.getByChannelId(channelId);

    const newMember = await prisma.channelMember.findFirst({
      where: {
        AND: {
          channel_id: channelId,
          user_id: userId,
        },
      },
    });

    for await (let member of channel.members) {
      emitingNewChannelMembers(member.userId, {
        channelId: channelId,
        member: channelMemberDto(newMember),
      });

      emitNewMessage(member.userId, channel);
    }

    return res.status(200).json({ message: "Request accepted" });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

export {
  createChannel,
  userChannels,
  getChannel,
  deleteChannel,
  channelMessages,
  sendMessage,
  removeChannelmember,
  seenChannel,
  changeChannelName,
  requestJoinChannel,
  getChannelMembers,
  getChannelRequestJoin,
  acceptRequestChannelJoin,
};
