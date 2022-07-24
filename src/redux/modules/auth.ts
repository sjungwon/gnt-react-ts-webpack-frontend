import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import authAPI, { SigninData, SignupData } from "../../apis/auth";

//Auth 상태 정의
export interface AuthState {
  //로그인 상태에 사용
  loginStatus: "idle" | "pending" | "success" | "failed";
  loginMessage: string;
  //로그인 성공 시 사용자 이름, ID 저장
  username: string;
  userId: string;
  //관리자 계정 정보
  admin: boolean;
  //회원 가입 상태
  registerStatus: "idle" | "pending" | "success" | "failed";
  registerMessage: string;
}

//기본 값 정의
const initialState: AuthState = {
  loginStatus: "idle",
  loginMessage: "",
  username: "",
  userId: "",
  admin: false,
  registerStatus: "idle",
  registerMessage: "",
};

//로그인 Thunk 함수
export const signinThunk = createAsyncThunk(
  "auth/signin",
  async (signinData: SigninData) => {
    const response = await authAPI.signin(signinData);
    return response.data;
  }
);

//로그아웃 Thunk
export const signoutThunk = createAsyncThunk("auth/signout", async () => {
  await authAPI.signout();
});

//회원 가입 오류 타입
interface signupErrorBodyType {
  error: string;
  type: string;
}

//회원가입 Thunk
export const signupThunk = createAsyncThunk(
  "auth/signup",
  async (signupData: SignupData, { rejectWithValue }) => {
    try {
      await authAPI.signup(signupData);
    } catch (error: any) {
      //에러 발생시 에러 전달
      return rejectWithValue((error as AxiosError).response);
      // if (error.response) {
      //   rejectWithValue(error.response)
      //   const { type } = error.response.data as signupErrorBodyType;
      //   throw new Error(type);
      // }
    }
  }
);

//로그인 확인 Thunk -> access 토큰 만료 시 재발급에도 사용
export const checkThunk = createAsyncThunk("auth/check", async () => {
  const response = await authAPI.accessTokenRefresh();
  return response.data;
});

//redux slice 생성
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //로그인 진행
      .addCase(signinThunk.pending, (state) => {
        state.loginStatus = "pending";
      })
      //로그인 성공
      .addCase(signinThunk.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.username = action.payload.userData.username;
        state.userId = action.payload.userData.id;
        state.admin = action.payload.userData.admin;
        state.loginMessage = "";
      })
      //로그인 실패
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
      })
      //회원가입 진행
      .addCase(signupThunk.pending, (state) => {
        state.registerStatus = "pending";
      })
      //회원 가입 성공
      .addCase(signupThunk.fulfilled, (state) => {
        state.registerStatus = "success";
      })
      //회원 가입 실패 -> 실패 이유 message에 저장
      .addCase(signupThunk.rejected, (state, action) => {
        state.registerStatus = "failed";
        const error = action.payload as AxiosResponse<signupErrorBodyType>;
        switch (error.data.type) {
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
      })
      //로그인 확인 진행
      .addCase(checkThunk.pending, (state) => {
        state.loginStatus = "pending";
      })
      //로그인 확인 성공
      .addCase(checkThunk.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.username = action.payload.userData.username;
        state.userId = action.payload.userData.id;
        state.admin = action.payload.userData.admin;
        state.loginMessage = "";
      })
      //로그인 확인 실패
      .addCase(checkThunk.rejected, (state) => {
        state.loginStatus = "idle";
        state.username = "";
        state.userId = "";
        state.admin = false;
        state.loginMessage = "";
      })
      //로그아웃 진행
      .addCase(signoutThunk.pending, (state) => {
        state.loginStatus = "pending";
      })
      //로그아웃 성공
      //state 상태 비우기
      .addCase(signoutThunk.fulfilled, (state) => {
        state.loginStatus = "idle";
        state.loginMessage = "";
        state.username = "";
        state.userId = "";
        state.admin = false;
        state.registerStatus = "idle";
        state.registerMessage = "";
      })
      //로그아웃 실패
      .addCase(signoutThunk.rejected, (state) => {
        state.loginStatus = "idle";
      });
  },
});

export default authSlice.reducer;
