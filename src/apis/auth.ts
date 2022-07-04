import API from "./basic";

export interface LoginData {
  username: string;
  password: string;
}

export interface UserDataType {
  username: string;
  id: string;
  admin: boolean;
}

export interface LoginResDataType {
  userData: UserDataType;
  accessToken: string;
}

export class AuthAPI {
  private static readonly path = "auth/";
  public static login = (
    loginData: LoginData
  ): Promise<{ data: LoginResDataType }> => {
    const path = this.path + "signin/";
    return API.post(path, loginData);
  };
}
