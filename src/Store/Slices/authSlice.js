import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction(state, action) {
      state.user = action.payload;
    },
    updateUserAction(state, action) {
      state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
    },
    logoutAction(state) {
      state.user = null;
    },
  },
});

export const { loginAction, updateUserAction, logoutAction } = authSlice.actions;
export const selectAuthUser = (state) => state.auth.user;
export default authSlice.reducer;
