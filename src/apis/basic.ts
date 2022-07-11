import axios, { AxiosRequestConfig } from "axios";
import { accessTokenRefreshAPI } from "./auth";

export const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

export const APIWithToken = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

APIWithToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const origReq = error.config;
    console.log(origReq);
    if (error.response.data.type === "token expired") {
      //그냥 axios로 config 던지면 header 토큰 변경 전 상태로 던져짐
      //APIWithToken으로 던지면 token 변경 되기전에
      //다시 재호출 되는 경우가 발생 -> interceptors에 다시
      //token expired로 잡혀들어옴 -> 무한 루프
      //만약 refresh까지 만료된 경우면 -> 무한 루프
      //try, catch로 만약 토큰 갱신 실패하면 루프 안돌게 에러 처리
      //axios로 호출해서 interceptor에 잡히지 않게 처리
      //변경된 token 정보가 필요함 -> refresh 함수쪽에서 반환하게 처리
      //origReq에서 headers에 이전 토큰 정보 들어가 있어서 변경해줘야함
      try {
        const response = await accessTokenRefreshAPI();
        const newToken = response.data.accessToken;
        const newConfig: AxiosRequestConfig = {
          ...origReq,
          headers: {
            ...origReq.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return axios(newConfig);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const setAPIToken = (accessToken: string) => {
  return (APIWithToken.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${accessToken}`);
};
