import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthAPI, LoginData } from "../../apis/auth";

export interface AuthState {
  status: "idle" | "pending" | "success" | "failed";
  message: string;
  token: string;
  username: string;
  userId: string;
  admin: boolean;
}

const initialState: AuthState = {
  status: "idle",
  message: "",
  token: "",
  username: "",
  userId: "",
  admin: false,
};

export const fetchUserLogin = createAsyncThunk(
  "auth/login",
  async (loginData: LoginData) => {
    const response = await AuthAPI.login(loginData);
    return response.data;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLogin.pending, (state, action) => {
        console.log("pending");
        state.status = "pending";
      })
      .addCase(fetchUserLogin.fulfilled, (state, action) => {
        console.log("fullfiled", action.payload);
        state.status = "success";
        state.username = action.payload.userData.username;
        state.userId = action.payload.userData.id;
        state.admin = action.payload.userData.admin;
        state.token = action.payload.accessToken;
        state.message = "";
      })
      .addCase(fetchUserLogin.rejected, (state, action) => {
        console.log("reject", action.error);
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.message =
            "로그인에 실패했습니다. 사용자 이름 혹은 비밀번호를 다시 확인해주세요.";
        } else {
          state.message =
            "서버에 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        }
        state.status = "failed";
        state.username = "";
        state.userId = "";
        state.admin = false;
        state.token = "";
      });
  },
});

export default authSlice.reducer;
