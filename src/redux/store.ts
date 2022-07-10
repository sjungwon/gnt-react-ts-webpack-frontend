import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./modules/auth";
import categoryReducer from "./modules/category";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispath = typeof store.dispatch;
