import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./modules/auth";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispath = typeof store.dispatch;
