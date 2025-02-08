import { createSlice } from "@reduxjs/toolkit";
import { sendMessage, fetchMessages, markMessageAsRead, deleteMessages } from "../actions/myMessageActions"; // 액션 생성자 함수 경로
import { logoutUser } from "../actions/userActions"; // 로그아웃 액션 생성자 함수

const initialState = {
  messages: [
    {
      _id: "",          // 메시지 고유 ID
      isRead: false,    // 읽음 여부
      club: null,       // 클럽 ID (선택 사항)
    }
  ], 
  status: 'idle',       // 요청 상태 (idle, loading, succeeded, failed)
  error: null,          // 에러 메시지
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // 추가적인 동기 액션이 필요하면 여기에 작성
  },
  extraReducers: (builder) => {
    builder
       // 메시지 가져오기 요청 시작
      .addCase(fetchMessages.pending, (state) => {
      state.status = 'loading';
      })
      // 메시지 가져오기 성공
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // action.payload에서 isRead가 false인 메시지만 필터링하여 상태 업데이트
        state.messages = action.payload.filter(message => !message.isRead);
      })
      // 메시지 가져오기 실패
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 에러 메시지 저장
      })

      // 메시지 전송 
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      // 메시지 전송 성공
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push(action.payload); // 메시지 추가
      })
      // 메시지 전송 실패
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 에러 메시지 저장
      })

       // 로그아웃 요청 시작
       .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      // 로그아웃 성공
      .addCase(logoutUser.fulfilled, (state) => {
        // 상태 초기화
        state.messages = [];
        state.status = initialState.status;
        state.error = initialState.error;
      })
      // 로그아웃 실패
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 에러 메시지 저장
      })

      //읽음 처리
      .addCase(markMessageAsRead.pending, (state) => {
        state.status = 'loading';
      })
      // 메시지 읽음 상태 업데이트 성공
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = state.messages.filter(
          (message) => message._id !== action.payload
        ); // 읽음으로 표시된 메시지를 목록에서 제거
      })
      // 메시지 읽음 상태 업데이트 실패
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //안 읽음 삭제
      .addCase(deleteMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessages.fulfilled, (state, action) => {
        state.loading = false;
        // 삭제 성공 시 서버에서 반환된 최신 메시지 목록으로 상태 업데이트
        // 삭제된 메시지 ID들을 받아와서 상태에서 삭제
        const deletedMessageIds = action.meta.arg;  // deleteMessages 호출 시 전달된 selectedMessages
        // 삭제되지 않은 메시지만 남기기
        state.messages = state.messages.filter(message => !deletedMessageIds.includes(message._id));
      })
      .addCase(deleteMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default messageSlice.reducer;
