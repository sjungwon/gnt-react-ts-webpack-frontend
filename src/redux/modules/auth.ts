import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { signinAPI, SigninData, signupAPI, SignupData } from "../../apis/auth";

export interface AuthState {
  loginStatus: "idle" | "pending" | "success" | "failed";
  loginMessage: string;
  token: string;
  username: string;
  userId: string;
  admin: boolean;
  registerStatus: "idle" | "pending" | "success" | "failed";
  registerMessage: string;
}

const initialState: AuthState = {
  loginStatus: "idle",
  loginMessage: "",
  token: "",
  username: "",
  userId: "",
  admin: false,
  registerStatus: "idle",
  registerMessage: "",
};

export const signinThunk = createAsyncThunk(
  "auth/login",
  async (signinData: SigninData) => {
    const response = await signinAPI(signinData);
    return response.data;
  }
);

interface signupErrorBodyType {
  error: string;
  type: string;
}

export const signupThunk = createAsyncThunk(
  "auth/signup",
  async (signupData: SignupData) => {
    try {
      await signupAPI(signupData);
    } catch (error: any) {
      if (error.response) {
        const { type } = error.response.data as signupErrorBodyType;
        throw new Error(type);
      }
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signinThunk.pending, (state, action) => {
        state.loginStatus = "pending";
      })
      .addCase(signinThunk.fulfilled, (state, action) => {
        console.log("fullfiled", action.payload);
        state.loginStatus = "success";
        state.username = action.payload.userData.username;
        state.userId = action.payload.userData.id;
        state.admin = action.payload.userData.admin;
        state.token = action.payload.accessToken;
        state.loginMessage = "";
      })
      .addCase(signinThunk.rejected, (state, action) => {
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.loginMessage =
            "로그인에 실패했습니다. 사용자 이름 혹은 비밀번호를 다시 확인해주세요.";
        } else {
          state.loginMessage =
            "서버에 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        }
        state.loginStatus = "failed";
        state.username = "";
        state.userId = "";
        state.admin = false;
        state.token = "";
      })
      .addCase(signupThunk.pending, (state, action) => {
        state.registerStatus = "pending";
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.registerStatus = "success";
      })
      .addCase(signupThunk.rejected, (state, action) => {
        console.log(action.error);
        state.registerStatus = "failed";
        switch (action.error.message) {
          case "exist email":
            state.registerMessage =
              "중복된 이메일 입니다. 다른 이메일을 입력해주세요.";
            break;
          case "exist username":
            state.registerMessage =
              "중복된 사용자 이름 입니다. 다른 사용자 이름을 입력해주세요.";
            break;
          default:
            state.registerMessage =
              "가입에 실패 했습니다. 서버측 오류일 수 있으니 다시 시도해주세요.";
            break;
        }
      });
  },
});

export default authSlice.reducer;
