/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import { logOut, setCredentials } from "./authSlice";
import { setCurrentUser, removeCurrentUser } from "../user/userSlice";
import jwtDecode from "jwt-decode";
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //Login
    signIn: builder.mutation({
      query: (credintials: TLogin) => ({
        url: "/auth/signin",
        method: "POST",
        body: { ...credintials },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
          const decoded: any = jwtDecode(accessToken);
          const { userId, email, userName } = decoded.User;
          if (userId && email && userName) {
            dispatch(setCurrentUser({ userId, email, userName }));
          }
        } catch (error) { }
      },
    }),

    //logout
    signOut: builder.mutation({
      query: () => ({
        url: "/auth/signout",
        method: "POST",
        credentials: "include",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          if (res?.data) {
            dispatch(logOut());
            dispatch(removeCurrentUser());
          }
        } catch (error) { }
      },
    }),

    //Refresh
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
          const decoded: any = jwtDecode(accessToken);
          const { userId, email, userName } = decoded.User;
          if (userId && email && userName) {
            dispatch(setCurrentUser({ userId, email, userName }));
          }
        } catch (error) { }
      },
    }),

    //Register
    requestVerifyEmail: builder.mutation({
      query: ({ email, userName }: { email: string, userName: string }) => ({
        url: "/register/getotp",
        method: "POST",
        body: { email, userName },
      }),
    }),

    register: builder.mutation({
      query: (credintials: TRegister) => ({
        url: "/register",
        method: "POST",
        body: { ...credintials },
      }),
    }),
  }),
});

export const {
  useSignOutMutation,
  useRefreshMutation,
  useSignInMutation,
  useRegisterMutation,
  useRequestVerifyEmailMutation,
} = authApiSlice;
