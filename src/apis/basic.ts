import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token: string = config.params?.accessToken || "";

  console.log(token);
  if (token) {
    return {
      ...config,
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
  }

  return {
    ...config,
  };
});

export default API;
