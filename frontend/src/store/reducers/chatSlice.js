import { createSlice } from '@reduxjs/toolkit'; // Redux Toolkit의 createSlice를 사용하여 slice 생성
import {
  fetchClubDetailByClubId, // 클럽 세부정보를 가져오는 비동기 액션
  enterChatRoom, // 채팅방에 입장하는 비동기 액션
  fetchInitialMessages, // 초기 메시지를 가져오는 비동기 액션
  fetchOlderMessages // 이전 메시지를 가져오는 비동기 액션
} from '../actions/chatActions';

// 초기 state 설정
const initialState = {
  clubDetail: {}, // 클럽 세부정보 저장
  chatRooms: {}, // 채팅방 정보 저장
  messages: [], // 메시지 목록 저장
  status: 'idle', // 로딩 상태를 추적 ('idle', 'loading', 'succeeded', 'failed')
  error: null // 에러 메시지 저장
};

// chatSlice 생성
const chatSlice = createSlice({
  name: 'chat', // slice의 이름
  initialState, // 초기 상태
  reducers: {}, // 이 slice에서 사용하는 동기 액션은 없음
  extraReducers: (builder) => {
    

    // 채팅방 생성
    builder
      .addCase(enterChatRoom.pending, (state) => {
        state.status = 'loading'; // 요청이 시작되면 로딩 상태로 설정
      })
      .addCase(enterChatRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'; // 요청 성공 시 상태를 성공으로 변경
        // 서버로부터 받은 채팅방 데이터를 chatRooms에 저장하는 로직이 필요할 수 있음
        // state.chatRooms = action.payload; // 채팅방 데이터 저장 (여기서 업데이트 가능)
      })
      .addCase(enterChatRoom.rejected, (state, action) => {
        state.status = 'failed'; // 요청 실패 시 상태를 실패로 변경
        state.error = action.payload; // 에러 메시지를 state에 저장
      });

      // 클럽 세부정보를 가져오는 비동기 액션 처리
    builder
    .addCase(fetchClubDetailByClubId.pending, (state) => {
      console.log('Fetching club detail...');
      state.status = 'loading';
    })
    .addCase(fetchClubDetailByClubId.fulfilled, (state, action) => {
      console.log('Fetch successful:', action.payload);
      state.status = 'succeeded';
      state.clubDetail = action.payload;
    })
    .addCase(fetchClubDetailByClubId.rejected, (state, action) => {
      console.log('Fetch failed:', action.payload);
      state.status = 'failed';
      state.error = action.payload;
      });

    // 초기 메시지 가져오기
    builder
      .addCase(fetchInitialMessages.pending, (state) => {
        state.status = 'loading'; // 요청이 시작되면 로딩 상태로 설정
      })
      .addCase(fetchInitialMessages.fulfilled, (state, action) => {
        state.status = 'succeeded'; // 요청 성공 시 상태를 성공으로 변경
        state.messages = action.payload; // 서버로부터 받은 메시지 목록을 state에 저장
      })
      .addCase(fetchInitialMessages.rejected, (state, action) => {
        state.status = 'failed'; // 요청 실패 시 상태를 실패로 변경
        state.error = action.payload; // 에러 메시지를 state에 저장
      });

    // 이전 메시지 가져오기
    builder
      .addCase(fetchOlderMessages.pending, (state) => {
        state.status = 'loading'; // 요청이 시작되면 로딩 상태로 설정
      })
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
        state.status = 'succeeded'; // 요청 성공 시 상태를 성공으로 변경
        state.messages = [...state.messages, ...action.payload]; // 기존 메시지에 이전 메시지를 추가
      })
      .addCase(fetchOlderMessages.rejected, (state, action) => {
        state.status = 'failed'; // 요청 실패 시 상태를 실패로 변경
        state.error = action.payload; // 에러 메시지를 state에 저장
      });
  }
});

// chatSlice의 reducer를 export
export default chatSlice.reducer;
