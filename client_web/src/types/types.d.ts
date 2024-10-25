declare global {
  type TCurrentUer = {
    userId: string;
    email: string;
    userName: string;
  };
  type TLogin = {
    email: string;
    password: string;
  };

  type TRegister = {
    userName: string
    email: string;
    password: string;
    otp: string;
  };

  type TUserData = {
    id?: number;
    userId: string;
    userName: string
    avatarId?: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    channels: TChannelData[]
    messages: TMessageData[]
  };

  type TUpdateUser = {
    userId: string;
    userName: string
  };

  type TMessageData = {
    id?: number;
    channelId: string;
    messageId: string;
    senderId: string;
    message: string;
    type: string;
    createdAt: Date;
    updatedAt?: Date;
    user: TUserData;
    channel: TChannelData
  };

  type TChannelMemberData = {
    id?: number;
    userId: string;
    channelId: string;
    isSeen: boolean;
    joinApproved: boolean;
    isAdmin: boolean;
    user?: TUserData;
    channel?: TChannelData

  };
  type TChannelData = {
    id?: number;
    channelId: string;
    channelName?: string;
    avatarId?: string;
    createdAt: string;
    updatedAt?: string;
    messages: TMessageData[];
    members: TChannelMemberData[];
  };

  type TCreateChannel = {
    senderId: string;
    message: string;
    type: string;
    channelName: string;
    members: { userId: string }[];
  };

  type TSendMessage = {
    channelId: string;
    senderId: string;
    message: string;
    type: string;
  };
}

export { };
