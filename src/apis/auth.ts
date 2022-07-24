import defaultAPI from "./default";

export interface SigninData {
  username: string;
  password: string;
}

export interface UserDataType {
  username: string;
  id: string;
  admin: boolean;
}

export interface SigninResDataType {
  userData: UserDataType;
  accessToken: string;
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
}
export interface FindUserData {
  username: string;
  email: string;
}

export interface ChangePasswordData extends FindUserData {
  password: string;
}

class AuthAPI {
  private API = defaultAPI.API;
  private APIWithToken = defaultAPI.APIWithToken;
  private setAPIToken = defaultAPI.setAPIToken;
  private path = "auth/";

  //POST 로그인
  //로그인 API
  public signinAPI = async (
    signinData: SigninData
  ): Promise<{ data: SigninResDataType }> => {
    const loginPath = this.path + "signin";
    const response = await this.API.post(loginPath, signinData);
    const accessToken = response.data.accessToken;
    if (accessToken) {
      this.setAPIToken(accessToken);
    }
    return response;
  };

  //POST 로그아웃
  //요청 전송하면 서버에서 쿠키에 설정된 Refresh Token 정보를 지움
  public signoutAPI = (): Promise<void> => {
    const logoutPath = this.path + "signout";
    return this.API.post(logoutPath);
  };

  //POST 회원가입
  public signupAPI = (signupData: SignupData): Promise<void> => {
    const signupPath = this.path + "signup";
    return this.API.post(signupPath, signupData);
  };

  //POST access 토큰 refresh
  //프론트에 진입시 로그인 이력이 있는지 확인할 때도 사용
  //accessToken 못 받아 오면 로그인 안 되어 있는거
  public accessTokenRefreshAPI = async (): Promise<{
    data: SigninResDataType;
  }> => {
    const checkPath = this.path + `refresh`;
    const response = await this.API.post(checkPath);
    const accessToken = response.data.accessToken;
    if (accessToken) {
      this.setAPIToken(accessToken);
    }
    return response;
  };
  //POST 비밀번호 찾기
  //username, email을 전송(유저 정보가 맞는지 확인)
  //맞으면 암호 재설정
  public findPasswordAPI = async (
    findUserData: FindUserData
  ): Promise<void> => {
    const findPath = this.path + `find`;
    return this.API.post(findPath, findUserData);
  };

  //POST 암호 재설정
  public chagnePasswordAPI = async (
    changePasswordData: ChangePasswordData
  ): Promise<void> => {
    const changePath = this.path + "change";
    return this.API.post(changePath, changePasswordData);
  };
}

const authAPI = new AuthAPI();

export default authAPI;
