// store/index.js — the single Redux store for the whole app
//
// configureStore() from Redux Toolkit sets up:
//   • the reducer tree (one key per slice)
//   • redux-thunk middleware (for async actions)
//   • Redux DevTools wiring (open the browser extension to inspect state)
//
// Any new slice goes into the `reducer` map below.

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
