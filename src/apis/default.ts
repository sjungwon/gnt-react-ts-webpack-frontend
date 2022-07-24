import axios from "axios";

//axios 전역 설정
axios.defaults.baseURL = "http://localhost:8000";
//withCredentials
//CORS(Cross Origin Resource Sharing)인 경우 사용하는 옵션
//Same site request에는 아무 영향 없음
//CORS에서 withCredentials가 true이면 서버에서 response에 쿠키 지정
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.timeout = 3000;

//기본 API
class DefaultAPI {
  private _API = axios.create();
  private _APIWithToken = axios.create();

  public get API() {
    return this._API;
  }

  public get APIWithToken() {
    return this._APIWithToken;
  }

  //Token 설정
  public setAPIToken = (accessToken: string) => {
    return (this.APIWithToken.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`);
  };
}

const defaultAPI = new DefaultAPI();

export default defaultAPI;
