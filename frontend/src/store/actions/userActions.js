import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import { setFavoriteList } from '../reducers/wishSlice';
import { fetchMessages } from "./myMessageActions"; // 메시지 가져오기 액션
import axios from "axios";
// Redux Toolkit에서 createAsyncThunk를 가져옴

// 비동기 회원가입 액션 생성
export const registerUser = createAsyncThunk(
  "user/registerUser", // 액션 타입: "user/registerUser"
  async (body, thunkAPI) => {
    console.log("회원가입 데이터:", body); // 요청 데이터 확인
    try {
      const response = await axiosInstance.post(
        `/users/register`, // 회원가입 API 엔드포인트
        body // 요청 본문: 사용자 정보 (이메일, 비밀번호 등)
      );
      return response.data; // 성공 시 서버의 응답 데이터 반환
    } catch (error) {
      console.log(error); // 에러를 콘솔에 출력
      return thunkAPI.rejectWithValue(error.response.data || error.message);
      // 실패 시 에러 메시지 반환 (thunkAPI.rejectWithValue 사용)
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (body, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/users/login`, body);
      const userData = response.data; // 서버 응답에서 userData 추출
      // 찜목록
      thunkAPI.dispatch(fetchMessages(userData.user.email));
      thunkAPI.dispatch(setFavoriteList(userData.user.wish));

      return response.data;
      // 액션 페이로드 부분
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const authUser = createAsyncThunk(
  "user/authUser", //액션 타입 문자열
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/users/auth`);
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/users/logout`);

      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

// 마이 페이지 정보 불러오기
export const myPage = createAsyncThunk(
  'user/myPage',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/users/myPage');
      return response.data; // response.ok 대신 response.data를 반환
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data); // 오류 발생 시 rejectWithValue 사용
    }
  }
);

// 마이 페이지 정보 수정
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (body, thunkAPI) => {
    try {
      const response = await axiosInstance.put('/users/myPage/update', body);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const kakaoLoginUser = createAsyncThunk(
  "user/kakaoLoginUser",
  async (code, thunkAPI) => {
    try {
      const response = await axios.post(`http://localhost:4000/kakao/login`, { code }, { withCredentials: true });
      const userData = response.data; // 서버 응답에서 userData 추출

      if (userData.redirectUrl) {
        window.location.href = userData.redirectUrl; // 클라이언트 측에서 리디렉션 처리
      }
      // 찜목록
      thunkAPI.dispatch(fetchMessages(userData.user.email));
      thunkAPI.dispatch(setFavoriteList(userData.user.wish));

      return response.data;
      // 액션 페이로드 부분
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);