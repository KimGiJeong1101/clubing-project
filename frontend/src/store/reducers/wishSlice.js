import { createSlice } from '@reduxjs/toolkit';

// 초기 상태 정의
const initialState = {
  favoriteList: [], // 찜한 클럽 번호 리스트
};

// 슬라이스 정의
const wishSlice = createSlice({
  name: 'wish',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const { clubNumber } = action.payload;
      const index = state.favoriteList.indexOf(clubNumber);
      if (index === -1) {
        state.favoriteList.push(clubNumber); // 찜하기 추가
      } else {
        state.favoriteList.splice(index, 1); // 찜하기 제거
      }
    },
    setFavoriteList: (state, action) => {
      state.favoriteList = action.payload; // 찜하기 목록 설정
    },
  },
});

// 액션 생성자와 리듀서 추출
export const { toggleFavorite, setFavoriteList } = wishSlice.actions;
export default wishSlice.reducer;
