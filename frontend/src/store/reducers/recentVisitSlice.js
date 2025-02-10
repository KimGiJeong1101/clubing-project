import { createSlice } from "@reduxjs/toolkit";
import { saveVisitClub, readVisitClub } from "../actions/RecentVisitAction";
import { logoutUser } from "../actions/userActions";

// 초기 상태 정의
const initialState = {
    recentVisits: [], // 최근 방문 기록 저장 배열을 빈 배열로 초기화
    status: 'idle', // 로딩 상태 (idle, loading, succeeded, failed)
    error: null, // 오류 메시지
  };

const recentVisitSlice = createSlice({
  name: 'recentVisit',
  initialState,
  reducers: {
    // 필요한 경우 추가적인 동기 액션 정의
  },
  extraReducers: (builder) => {
    builder
      // 방문 클럽 가져오기 요청 시작
      .addCase(readVisitClub.pending, (state) => {
        state.status = 'loading';
      })
      // 방문 클럽 가져오기 성공
      .addCase(readVisitClub.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recentVisits = action.payload; // 서버에서 받은 데이터로 업데이트
      })
      // 방문 클럽 가져오기 실패
      .addCase(readVisitClub.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 에러 메시지 저장
      })

      // 클럽 저장
      .addCase(saveVisitClub.pending, (state) => {
        state.status = 'loading'; // 요청이 진행 중일 때 상태 설정
      })
      .addCase(saveVisitClub.fulfilled, (state, action) => {
        state.status = 'succeeded'; // 요청 성공 시 상태와 데이터 업데이트
        state.recentVisits.push(action.payload); // 서버에서 받은 데이터로 업데이
      })
      .addCase(saveVisitClub.rejected, (state, action) => {
        state.status = 'failed'; // 요청 실패 시 상태와 오류 메시지 업데이트
        state.error = action.payload; // 오류 메시지 저장
      })

       // 로그아웃 요청 시작
       .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      // 로그아웃 성공
      .addCase(logoutUser.fulfilled, (state) => {
        // 상태 초기화
        state.recentVisits = []; // `recentVisits` 초기화
        state.status = initialState.status;
        state.error = initialState.error;
      })
      // 로그아웃 실패
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 에러 메시지 저장
      });
  },
});

// 액션 생성자와 리듀서를 내보냅니다.
export const { actions, reducer } = recentVisitSlice;
export default recentVisitSlice.reducer;
