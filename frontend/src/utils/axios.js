import axios from "axios";
import Cookies from "js-cookie";

// 환경 변수 설정을 수정합니다.
const isProduction = process.env.NODE_ENV === "production";
const axiosInstance = axios.create({
  baseURL: isProduction ? "" : "http://localhost:4000",
  withCredentials: true, // 모든 요청에 쿠키와 자격 증명을 포함
});

let isRefreshing = false;
let failedRequestsQueue = [];

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // JWT를 쿠키에 저장하고 있으므로, 헤더에 추가할 필요 없음
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급 받기
          const response = await axiosInstance.post("/users/refresh-token", null, {
            // 서버에서 쿠키를 자동으로 읽어오기 때문에 헤더 설정이 필요 없음
          });

          const newAccessToken = response.data.accessToken;

          // 실패한 요청들을 재시도
          failedRequestsQueue.forEach((cb) => cb(newAccessToken));
          failedRequestsQueue = [];

          isRefreshing = false;

          // 원래의 요청을 새로운 액세스 토큰으로 다시 시도
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;

          // 쿠키와 로컬 스토리지를 초기화
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.removeItem("persist:root");

          // 삭제 확인 로그 추가
          console.log("AccessToken 쿠키 삭제:", Cookies.get("accessToken")); // null이어야 함
          console.log("RefreshToken 쿠키 삭제:", Cookies.get("refreshToken")); // null이어야 함
          console.log("Persist root 삭제:", localStorage.getItem("persist:root")); // null이어야 함

          // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        // 실패한 요청을 대기열에 추가
        failedRequestsQueue.push((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
