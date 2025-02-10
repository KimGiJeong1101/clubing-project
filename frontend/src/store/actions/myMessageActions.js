import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../utils/axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/users/messages/${email}`); // 유저 이메일로 메시지 가져오기
      return response.data; // 서버에서 가져온 메시지 데이터
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

// 메시지 전송 액션 정의
export const sendMessage = createAsyncThunk(
  'messages/sendMessage', // 액션 타입
  async (message, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        '/users/messages', // 메시지 전송 API 엔드포인트
        message // 요청 본문: 메시지 데이터 (club, recipient, sender, content, title)
      );
      return response.data; // 성공 시 서버의 응답 데이터 반환
    } catch (error) {
      console.log(error); // 에러를 콘솔에 출력
      return thunkAPI.rejectWithValue(error.response.data || error.message);
      // 실패 시 에러 메시지 반환
    }
  }
);

// 메시지 읽음 액션 정의
export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead', // 액션 타입
  async (messageId, thunkAPI) => {
    try {
      // 서버에 메시지 상태 업데이트 요청
      await axiosInstance.put(`/users/messages/changestate`, { ids: [messageId] });
      return messageId; // 성공 시 메시지 ID 반환
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

// 메시지 삭제 
export const deleteMessages = createAsyncThunk(
  'messages/deleteMessages', // 액션 타입
  async (selectedMessages, thunkAPI) => {
    try {
      // 서버에 메시지 삭제 요청
      const response = await axiosInstance.post('/users/messages/delete', { ids: selectedMessages });
      return response.data; // 성공 시 서버 응답 데이터 반환
    } catch (error) {
      // 에러 발생 시 에러 메시지 반환
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);
