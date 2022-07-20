import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./modules/auth";
import categoryReducer from "./modules/category";
import profileReducer from "./modules/profile";
import postReducer from "./modules/post";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    profile: profileReducer,
    post: postReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
