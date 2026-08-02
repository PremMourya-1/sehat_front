import { createSlice } from "@reduxjs/toolkit";
import { AUTH_VIEWS } from "@/Constant/Constant";

const initialState = {
  authModalOpen: false,
  authModalView: AUTH_VIEWS.LOGIN,
  redirectAfterAuth: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal(state, action) {
      const { view, redirectTo } = action.payload || {};
      state.authModalOpen = true;
      state.authModalView = view || AUTH_VIEWS.LOGIN;
      state.redirectAfterAuth = redirectTo || null;
    },
    setAuthModalView(state, action) {
      state.authModalView = action.payload;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
  },
});

export const { openAuthModal, setAuthModalView, closeAuthModal } =
  uiSlice.actions;

export const selectAuthModalOpen = (state) => state.ui.authModalOpen;
export const selectAuthModalView = (state) => state.ui.authModalView;
export const selectRedirectAfterAuth = (state) => state.ui.redirectAfterAuth;

export default uiSlice.reducer;
