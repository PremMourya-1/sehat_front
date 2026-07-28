import { createSlice } from "@reduxjs/toolkit";
import { AUTH_VIEWS } from "@/Constant/Constant";

const initialState = {
  authModalOpen: false,
  authModalView: AUTH_VIEWS.LOGIN,
  redirectAfterAuth: null,
  pendingEmailForOtp: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal(state, action) {
      const { view, redirectTo, email } = action.payload || {};
      state.authModalOpen = true;
      state.authModalView = view || AUTH_VIEWS.LOGIN;
      state.redirectAfterAuth = redirectTo || null;
      if (email) state.pendingEmailForOtp = email;
    },
    setAuthModalView(state, action) {
      state.authModalView = action.payload;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
      state.pendingEmailForOtp = null;
    },
  },
});

export const { openAuthModal, setAuthModalView, closeAuthModal } =
  uiSlice.actions;

export const selectAuthModalOpen = (state) => state.ui.authModalOpen;
export const selectAuthModalView = (state) => state.ui.authModalView;
export const selectRedirectAfterAuth = (state) => state.ui.redirectAfterAuth;
export const selectPendingEmailForOtp = (state) => state.ui.pendingEmailForOtp;

export default uiSlice.reducer;
