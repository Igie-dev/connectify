/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";

const imageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadAvatar: builder.mutation({
      query: ({ data, id }: { data: FormData; id: string }) => ({
        url: `/images/avatar/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["avatar"],
    }),

    getAvatarLink: builder.query({
      query: (id: string) => ({
        url: `/images/avatar/${id}`,
        method: "GET",
      }),
      providesTags: ["avatar"],
    }),

    deleteAvatar: builder.mutation({
      query: (id: string) => ({
        url: `/images/avatar/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["avatar"],
    }),
    sendImage: builder.mutation({
      query: (data: FormData) => ({
        url: `/images/sendimage`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useUploadAvatarMutation,
  useGetAvatarLinkQuery,
  useDeleteAvatarMutation,
  useSendImageMutation,
} = imageApiSlice;
