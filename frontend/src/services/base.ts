import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, removeAccessToken, removeRefreshToken } from "@/lib/tokens";
import { refreshAccessToken } from "@/services/accounts";


const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/`,
  headers: {'Content-Type': 'application/json'},
});


instance.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


function logout() {
  removeAccessToken();
  removeRefreshToken();
}


instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (originalRequest.url.includes('/token/refresh')) {
      logout();
      return Promise.reject(error);
    }
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const response = await refreshAccessToken(refreshToken);
      const accessToken = response.data.access;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      setAccessToken(accessToken);
      return instance(originalRequest);
    } catch (error) {
      logout();
      return Promise.reject(error);
    }
  }
);


export default instance;