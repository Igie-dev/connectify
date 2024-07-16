/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userId: null,
    email: null,
    userName: null
  },
  reducers: {
    setCurrentUser: (state, action) => {
      const { userId, email, userName } = action.payload;
      state.email = email;
      state.userId = userId;
      state.userName = userName
    },
    removeCurrentUser: (state) => {
      state.email = null;
      state.userId = null;
      state.userName = null;
    },
  },
});

export const { setCurrentUser, removeCurrentUser } = userSlice.actions;
export const getCurrentUser = (state: any) => state.user;
export default userSlice.reducer;
