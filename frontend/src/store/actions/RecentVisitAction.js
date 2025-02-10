import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../utils/axios";

// 불러오기
export const readVisitClub = createAsyncThunk(
    "messages/readVisitClub",
    async (email, thunkAPI) => {
      try {
        const response = await axiosInstance.get(`/users/recentvisit/${email}`); // 유저 이메일로 메시지 가져오기
        return response.data; // 서버에서 가져온 메시지 데이터
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data || error.message);
      }
    }
  );

// 메시지 전송 액션 정의
export const saveVisitClub = createAsyncThunk(
    'recentvisit/saveVisitClub', // 액션 타입
    async (body, thunkAPI) => {
      try {
        const response = await axiosInstance.post(
          '/users/recentvisit', // 메시지 전송 API 엔드포인트
          body // 요청 본문: 메시지 데이터 
        );
        return response.data; // 성공 시 서버의 응답 데이터 반환
      } catch (error) {
        console.log(error); // 에러를 콘솔에 출력
        return thunkAPI.rejectWithValue(error.response.data || error.message);
        // 실패 시 에러 메시지 반환
      }
    }
  );