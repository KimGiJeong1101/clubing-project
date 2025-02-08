import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../store/actions/userActions";
import { Container, TextField, Typography, Box, FormControlLabel, } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // 아이콘
import Mail from "@mui/icons-material/MailOutline"; // 아이콘
import { useNavigate } from "react-router-dom"; // useNavigate 임포트
import FindEmailPage from "./FindEmail";
import FindPasswordPage from "./FindPassword"; // 수정된 부분
import { styled } from "@mui/material/styles";
import '../../../App.css';
import '../../../assets/styles/LoginCss.css';
import CustomButton2 from '../../../components/club/CustomButton2.jsx'
import CustomCheckbox from '../../../components/club/CustomCheckbox.jsx'
import axios from 'axios';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // 값 설정을 위해 사용
    watch, // 상태를 감시하기 위해 사용
  } = useForm({ mode: "onChange" });

  const dispatch = useDispatch();
  const rememberMe = watch("rememberMe"); // rememberMe 체크박스의 값 확인
  const navigate = useNavigate(); // useNavigate 사용

  // 아이디 중복 / 비번 정확성 확인
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("lastLoginEmail");
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    setValue("rememberMe", rememberMe); // 체크박스 상태 설정

    if (savedEmail) {
      setValue("email", savedEmail); // 입력 필드에 값 설정
    }
  }, [setValue]);

  const onSubmit = async ({ email, password }) => {
    try {
      const body = {
        email,
        password,
      };
      const response = await dispatch(loginUser(body));
      //thunk에서 생성한 펜딩,풀필드, 리젝트 값 userSlice로 보내기
      //상태관리

      // 로그인 성공 여부 확인
      if (response.meta.requestStatus === "fulfilled") {
        navigate("/clublist");
        reset();
      } else {
          // 여기에서 에러를 처리합니다.
      if (response.payload.error === '이메일이 확인되지 않습니다.') {
        setEmailError('이메일이 확인되지 않습니다.');
        setPasswordError('');
      } else if (response.payload.error === '비밀번호가 틀렸습니다.') {
        setPasswordError('비밀번호가 틀렸습니다.');
        setEmailError('');
      } else if (response.payload.message === '탈퇴한 회원입니다.') {
        // 탈퇴한 회원 관련 오류 처리
        setEmailError('탈퇴한 회원입니다.');
        setPasswordError('');
      } else {
        // 다른 오류 메시지 처리
        setEmailError('알 수 없는 오류가 발생했습니다.');
        setPasswordError('');
      }
    }
    
      // "Remember Me" 체크박스가 선택되었을 때만 로컬 스토리지에 저장
      if (rememberMe) {
        localStorage.setItem("lastLoginEmail", email);
        localStorage.setItem("rememberMe", "true"); // 체크 상태 저장
      } else {
        localStorage.removeItem("lastLoginEmail");
        localStorage.setItem("rememberMe", "false"); // 체크 해제 상태 저장
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      // 서버 오류 또는 네트워크 오류 처리
      setEmailError("이메일 입력에 문제가 발생했습니다.");
      setPasswordError("비밀번호 입력에 문제가 발생했습니다.");
    }
  };

  const userEmail = {
    required: "필수 필드입니다.",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "유효한 이메일 주소를 입력하세요.",
    },
  };

  const userPassword = {
    required: "필수 필드입니다.",
    minLength: {
      value: 3,
      message: "최소 6자입니다.",
    },
  };

  // 모달 열림 상태 관리
  const [isPopupOpen, setIsPopupOpen] = useState({
    email: false,
    password: false,
  });

  const consentPopupOpen = (type) => {
    setIsPopupOpen((prev) => ({ ...prev, [type]: true }));
  };

  const consentPopupClose = (type) => {
    setIsPopupOpen((prev) => ({ ...prev, [type]: false }));
  };

  // 스타일을 정의하는 styled 컴포넌트
  const ClickableSpan = styled("span")(({ theme }) => ({
    color: "black", // 기본 텍스트 색상
    cursor: "pointer", // 클릭 가능한 커서
    transition: "color 0.3s, transform 0.3s", // 색상 및 변형에 대한 부드러운 전환

    "&:hover": {
      color: theme.palette.primary.dark, // 호버 시 색상 변경
      transform: "scale(1.05)", // 호버 시 크기 확대 효과
    },

    "&:focus": {
      outline: "none", // 포커스 시 기본 윤곽선 제거
      boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.2)", // 포커스 시 그림자 효과
    },
  }));
  
//카카오 로그인

// 로그인 버튼 클릭 시
const kakaoLogin = () => {
  const clientId = process.env.REACT_APP_KAKAO_API_URL;
  const redirectUri = 'http://localhost:3000/kakao/callback';
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

  window.location.href = authUrl;
  //window.open(authUrl, 'kakaoLogin', 'width=600,height=700');
};
  return (
    <Container
      sx={{
        mt: 8,
        width: "100%",
        maxWidth: {
          xs: "120%", // 모바일 화면: 최대 너비를 90%로 설정
          sm: "500px", // 작은 화면: 최대 너비를 600px로 설정
        },
        padding: {
          xs: "8 8px", // 모바일 화면: 좌우 패딩 8px
          sm: "8 10px", // 작은 화면: 좌우 패딩 16px
        },
        fontFamily: 'KCC-Hanbit', // 글씨체 적용
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mt: 2,
          mb: 2,
          textAlign: "center",
        }}
      >
        <img
          src="/logo/khaki_long_h.png"
          style={{
            display: "block",
            margin: "auto auto 40px auto",
            width: "300px", // 원하는 크기로 설정
            height: "auto",
          }}
        />
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          boxShadow: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            mb: 2,
            alignSelf: "flex-start", // 부모 요소와 상관없이 해당 요소만 왼쪽 정렬
            fontWeight: "bold",
          }}
        >
      
        </Typography>
        {/* 아이디 */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              width: "160%", // 부모 요소의 너비를 160%로 설정
            }}
          >
            <Mail
              style={{
                marginRight: "5px",
                marginLeft: "-80px",
                marginBottom: "10px",
                color: "gray",
                fontSize: "40px",
              }}
            />
            <TextField
              fullWidth
              label="이메일"
              margin="normal"
              variant="outlined"
              error={!!emailError || !!errors.email} // 이메일 에러가 있을 때 빨간 박스
              helperText={emailError || errors.email?.message || " "} // 이메일 에러 메시지
              {...register("email", userEmail)}
            />
          </Box>
          {/* 비밀번호 */}
          <Box
            display="flex"
            alignItems="center"
            sx={{
              width: "160%", // 부모 요소의 너비를 160%로 설정
            }}
          >
            <LockOutlinedIcon
              style={{
                marginRight: "5px",
                marginLeft: "-80px",
                marginBottom: "10px",
                color: "gray",
                fontSize: "40px",
              }}
            />
            <TextField
              fullWidth
              label="패스워드"
              margin="normal"
              variant="outlined"
              type="password"
              error={!!passwordError || !!errors.password} // 비밀번호 에러가 있을 때 빨간 박스
              helperText={passwordError || errors.password?.message || " "} // 비밀번호 에러 메시지
              {...register("password", userPassword)}
            />
          </Box>
           {/* 아이디 기억 */}
          <Box
            display="flex"
            sx={{
              width: "100%", // 부모 요소의 너비를 100%로 설정
              marginLeft: "-60px",
            }}
          >
          <FormControlLabel
            control={
              <CustomCheckbox
                {...register("rememberMe")}
                checked={watch("rememberMe") ? true : false} // register로 상태 관리
              />
            }
            label="아이디 기억하기"
            sx={{
              // 체크박스와 라벨 간의 간격 조정
              '& .MuiFormControlLabel-label': {
                marginLeft: '-20px', // 라벨과 체크박스 간의 간격을 조정합니다.
              },
            }}
          />
          </Box>
          <CustomButton2
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              mb: 1,
              width: "160%", // 부모 요소의 너비를 160%로 설정
              marginLeft: "-50px",
            }}
          >
            로그인
          </CustomButton2>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              "& a": {
                textDecoration: "none", // 기본 상태에서 밑줄 제거
                color: "blue", // 기본 글자색
                transition: "color 0.3s", // 부드러운 색상 전환
                "&:hover": {
                  textDecoration: "underline", // 호버 시 밑줄 추가
                  color: "darkblue", // 호버 시 글자색 변경
                },
              },
            }}
          >
            처음 방문하셨나요? | {/*{' '} 공백추가  */}
            <a href="/register">회원가입</a>
          </Typography>
        </form>
        <Box 
         sx={{
          mt: 2,
        }}
        onClick={kakaoLogin}
        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
        >
          <img src="/auth/kakao_login_icon_long.png" alt="버튼 이미지" />
      </Box>
      </Box>
    
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="row" // 수직으로 배치하려면 'column'으로 변경
        sx={{ mt: 2 }}
      >
        <ClickableSpan
          onClick={() => consentPopupOpen("email")}
          role="button" // 버튼 역할을 명시
        >
          아이디 찾기
        </ClickableSpan>

        {/* FindEmailPage 모달 */}
        <FindEmailPage open={isPopupOpen.email} onClose={() => consentPopupClose("email")} />
        <Typography style={{ marginLeft: "10px", marginRight: "10px" }}>|</Typography>
        <ClickableSpan
          onClick={() => consentPopupOpen("password")}
          role="button" // 버튼 역할을 명시
        >
          비밀번호 찾기
        </ClickableSpan>
        {/* FindPasswordPage  모달 */}
        <FindPasswordPage open={isPopupOpen.password} onClose={() => consentPopupClose("password")} />
      </Box>
    </Container>
  );
};

export default LoginPage;
