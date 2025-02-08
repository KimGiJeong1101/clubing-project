import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  authUser,
  logoutUser,
  myPage,
  updateUser,
  kakaoLoginUser,
} from "../actions/userActions";
import { Snackbar, Alert } from "@mui/material";

const initialState = {
  userData: {
    user: {
      email: "", // 사용자 이메일
      name: "", // 사용자 이름
      nickName: "", // 사용자 닉네임
      age: {
        year: null, // 생년
        month: null, // 생월
        day: null, // 생일
      },
      gender: "", // 성별
      profilePic: {
        originalImage: " ", // 원본 프로필 이미지 URL
        thumbnailImage: " ", // 썸네일 프로필 이미지 URL
        introduction: " ", // 프로필 소개글
      },
      homeLocation: {
        city: "", // 거주지 도시 이름
        district: "", // 거주지 구/군 이름
        neighborhood: "", // 거주지 동/읍/면 이름
      },
      interestLocation: {
        city: "", // 관심 지역 도시 이름
        district: "", // 관심 지역 구/군 이름
        neighborhood: "", // 관심 지역 동/읍/면 이름
      },
      workplace: {
        city: "", // 직장 도시 이름
        district: "", // 직장 구/군 이름
        neighborhood: "", // 직장 동/읍/면 이름
      },
      category: {
        main: "", // 카테고리 메인
        sub: [], // 카테고리 서브
      },
      job: [], // 업종 또는 직무 (최대 3개 선택 가능)
      roles: 1, // 사용자 역할 (기본값: 일반 사용자)
      phone: "", // 전화번호
      termsAccepted: false, // 이용약관 동의 여부
      privacyAccepted: false, // 개인정보 처리방침 동의 여부
      marketingAccepted: false, // 마케팅 정보 수신 동의 여부
      wish: [], // 찜한 모임
      history: [], // 최근 본 모임
      isActive: false, // 탈퇴 회원 관리
    },
  },
  isAuth: false, //true면 로그인되어 있는
  isLoading: false, // 데이터를 가져오는 중이면 true
  error: "",
  snackbar: {
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
  extraReducers: (builder) => {
    builder
    // 회원가입        
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
      state.snackbar = {
          open: true,
          message: '회원가입을 성공했습니다.',
          severity: 'success',
      };
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || '회원가입 실패';
      state.snackbar = {
          open: true,
          message: action.payload || '회원가입 실패',
          severity: 'error',
      };
    })
    // 로그인
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userData = action.payload;
      state.isAuth = true;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || '로그인 실패';
      state.snackbar = {
        open: true,
        message: '로그인 실패',
        severity: 'error',
    };
    })

    // 카카오 로그인 처리
    .addCase(kakaoLoginUser.pending, (state) => {
      state.isLoading = true; // 로그인 요청 시작 시 로딩 상태 설정
    })
    .addCase(kakaoLoginUser.fulfilled, (state, action) => {
      state.isLoading = false; // 로그인 요청이 성공적으로 완료되면 로딩 해제
      state.userData = action.payload; // 로그인한 사용자 데이터 저장
      state.isAuth = true; // 인증 상태 설정
    })
    .addCase(kakaoLoginUser.rejected, (state, action) => {
      state.isLoading = false; // 로그인 요청이 실패하면 로딩 해제
      state.error = action.payload || '로그인 실패'; // 에러 메시지 저장
      state.snackbar = {
        open: true, // 스낵바 열기
        message: '로그인 실패', // 표시할 메시지
        severity: 'error', // 에러 유형
      };
    })

    // 인증
    .addCase(authUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(authUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
        state.isAuth = true;
    })
    .addCase(authUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log('State before resetting:', state); // 상태 출력
        state.userData = initialState.userData; // 상태 초기화
        console.log('State after resetting:', state); // 상태 출력
        state.isAuth = false; 
    })

    // 로그아웃
    .addCase(logoutUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(logoutUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userData = initialState.userData;
      state.isAuth = false;
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || '로그아웃 실패';
      state.snackbar = {
        open: true,
        message: '로그아웃 실패',
        severity: 'error',
    };
    })
    //myPage
    .addCase(myPage.pending, (state) => {
    state.isLoading = true;
    })
    .addCase(myPage.fulfilled, (state, action) => {
    state.isLoading = false;
    state.userData = action.payload;
    state.isAuth = true;
    })
    .addCase(myPage.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.payload || '정보 가져오기 실패';
    state.isAuth = false;
    })

    //myPage 수정
    .addCase(updateUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(updateUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userData.user = action.payload;
      state.snackbar = {
          open: true,
          message: '정보가 성공적으로 업데이트되었습니다.',
          severity: 'success',
      };
    })
    .addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || '정보 업데이트 실패';
      state.snackbar = {
          open: true,
          message: '정보 업데이트에 실패했습니다.',
          severity: 'error',
      };
    });
    }
});

export const { closeSnackbar } = userSlice.actions;
export default userSlice.reducer;