/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
const messagesLimit = import.meta.env.VITE_MESSAGES_LIMIT;
const channelApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserChannels: builder.query({
      query: ({ userId, search }: { userId: string; search: string }) => ({
        url: `/channels/user/${userId}${search ? `?search=${search}` : ""
          }`,
        method: "GET",
      }),
    }),

    getChannelMessages: builder.mutation({
      query: ({
        channelId,
        cursor,
      }: {
        channelId: string;
        cursor?: number | null;
      }) => ({
        url: `/channels/${channelId}/messages?take=${messagesLimit}${cursor ? `&cursor=${cursor}` : ""
          }`,
        method: "GET",
      }),
    }),

    getChannel: builder.query({
      query: (channelId: string) => ({
        url: `/channels/${channelId}`,
        method: "GET",
      }),
    }),

    deleteChannel: builder.mutation({
      query: ({
        channelId,
        userId,
      }: {
        channelId: string;
        userId: string;
      }) => ({
        url: `/channel`,
        method: "DELETE",
        body: {
          channelId,
          userId,
        }
      }),
    }),

    sendMessage: builder.mutation({
      query: (newmessage: TSendMessage) => ({
        url: `/channels/${newmessage.channelId}/messages`,
        method: "POST",
        body: newmessage
      })
    }),

    createChannel: builder.mutation({
      query: (data: TCreateChannel) => ({
        url: "/channels",
        method: "POST",
        body: data
      })
    }),

    changeChannelName: builder.mutation({
      query: (data: { channelId: string, name: string, userId: string }) => ({
        url: "/channels/changename",
        method: "POST",
        body: data
      })
    }),

    removeChannelMember: builder.mutation({
      query: (data: { channelId: string, userId: string, type: string }) => ({
        url: "/channels/members/remove",
        method: "DELETE",
        body: data
      })
    }),

    seenChannel: builder.mutation({
      query: (data: { channelId: string, userId: string }) => ({
        url: "/channels/messages/seen",
        method: "POST",
        body: data
      }),
    }),
    requestJoinChannel: builder.mutation({
      query: (data: { channelId: string, userId: string }) => ({
        url: "/channels/members/join",
        method: "POST",
        body: data
      })
    }),

    getChannelMembers: builder.query({
      query: (channelId: string) => ({
        url: `/channels/members/${channelId}`,
        method: "GET",
      }),
    }),
    getChannelRequestJoin: builder.query({
      query: (channelId: string) => ({
        url: `/channels/members/join/${channelId}`,
        method: "GET",
      }),
    }),
    acceptChannelJoinRequest: builder.mutation({
      query: (data: { channelId: string, userId: string }) => ({
        url: "/channels/members/join/accept",
        method: "POST",
        body: data
      })
    }),
  }),
});
//TODO
//Make req for user request join to channel

export const {
  useGetUserChannelsQuery,
  useGetChannelMessagesMutation,
  useGetChannelQuery,
  useDeleteChannelMutation,
  useSendMessageMutation,
  useChangeChannelNameMutation,
  useCreateChannelMutation,
  useRemoveChannelMemberMutation,
  useSeenChannelMutation,
  useGetChannelMembersQuery,
  useGetChannelRequestJoinQuery,
  useRequestJoinChannelMutation,
  useAcceptChannelJoinRequestMutation,
} = channelApiSlice;
