import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Redux Toolkit의 createAsyncThunk를 사용하여 비동기 액션을 생성
export const makeEnterChat = createAsyncThunk(
  "chat/makeEnterChat", // 액션 타입을 'chat/makeEnterChat'으로 설정
  async ({ clubId, participants }, thunkAPI) => {
    // 비동기 작업을 처리할 함수
    try {
      // Axios를 사용하여 서버에 POST 요청을 보내고, 채팅방을 생성
      const response = await axiosInstance.post("/clubs/chatrooms/room", {
        clubId, // 클럽 ID (채팅방이 속하는 클럽의 식별자)
        participants, // 참여자 목록 (채팅방에 참여할 유저들의 ID 배열)
      });

      // 요청이 성공하면 서버에서 응답받은 데이터를 반환
      return response.data;
    } catch (error) {
      // 에러가 발생하면 에러 메시지를 콘솔에 출력
      console.error("Error entering chat room:", error);

      // thunkAPI의 rejectWithValue를 사용하여 에러 메시지를 반환
      // 서버로부터 에러 응답이 있으면 그것을 반환, 없으면 일반 에러 메시지 반환
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getChatByClubid = createAsyncThunk("chat/getChatByClubid", async (clubId, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/clubs/chatrooms/room/${clubId}`); // clubId를 사용하여 클럽 정보를 가져오는 엔드포인트
    return response.data;
  } catch (error) {
    console.error("Error fetching club detail by club ID:", error);
    return thunkAPI.rejectWithValue(error.response.data || error.message);
  }
});

// 초기 메시지 가져오기
export const firstMessageGet = createAsyncThunk("chat/firstMessageGet", async (clubId, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/clubs/chatrooms/${clubId}/messages?limit=30`);
    return response.data;
  } catch (error) {
    console.error("Error fetching initial messages:", error);
    return thunkAPI.rejectWithValue(error.response.data || error.message);
  }
});

// 이전 메시지 가져오기
export const OlderMessageGet = createAsyncThunk("chat/OlderMessageGet", async ({ clubId, skip }, thunkAPI) => {
  console.log("오키 해보자");
  try {
    const response = await axiosInstance.get(`/clubs/chatrooms/${clubId}/messages?skip=${skip}&limit=30`);
    return response.data;
  } catch (error) {
    console.error("Error fetching older messages:", error);
    return thunkAPI.rejectWithValue(error.response.data || error.message);
  }
});
