import API from "./basic";

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

const path = "auth/";

export const signinAPI = (
  signinData: SigninData
): Promise<{ data: SigninResDataType }> => {
  const loginPath = path + "signin/";
  return API.post(loginPath, signinData);
};

export const signupAPI = (signupData: SignupData): Promise<void> => {
  const signupPath = path + "signup/";
  return API.post(signupPath, signupData);
};
