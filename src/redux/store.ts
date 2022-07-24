import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./modules/auth";
import categoryReducer from "./modules/category";
import profileReducer from "./modules/profile";
import postReducer from "./modules/post";

//Redux store 생성
export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    profile: profileReducer,
    post: postReducer,
  },
});

//State 타입 export
export type RootState = ReturnType<typeof store.getState>;

//Dispatch 타입 export
export type AppDispatch = typeof store.dispatch;
