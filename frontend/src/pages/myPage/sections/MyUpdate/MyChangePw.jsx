import React, { useState, } from 'react';
import { useForm,} from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // 추가: useNavigate 훅을 가져옵니다.
import axiosInstance from '../../../../utils/axios'
import { useSelector } from 'react-redux';
import { TextField, Typography, Box,  IconButton, InputAdornment,
        } from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import '../../../../assets/styles/LoginCss.css'
import CustomButton2 from '../../../../components/club/CustomButton2.jsx'
import CustomSnackbar from '../../../../components/auth/Snackbar';

const MyChangePw = ({ view }) => {
  const email = useSelector((state) => state.user?.userData?.user.email || {});
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onChange', // 실시간 유효성 검사 설정
  });
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);

const handleClickShowPassword = () => 
  setShowPassword(!showPassword);
const handleClickShowPasswordCheck = () => 
  setShowPasswordCheck(!showPasswordCheck);

 // 비밀번호 유효성 검사 규칙
 const userPassword = {
  required: "필수 필드입니다.",
  minLength: {
    value: 8,
    message: "최소 8자입니다."
  },validate: value => {
    // 비밀번호 유효성 검사 정규 표현식
     const regex = /^(?=.*[a-zA-Z\u3131-\uD79D])(?=.*[\W_]).{6,}$/;
     if (!regex.test(value)) {
       return '안전한 비밀번호를 위해 영문 대/소문자, 특수문자 사용해 주세요.';
     }
     return true; // 유효성 검사 통과
  }
};
console.log(errors);
const userPasswordCheck = {
  required: 0,
  minLength: {
    value: 8,
    message: "최소 8자입니다."
  },
  validate: (value) => value === watch('password') || '비밀번호가 일치하지 않습니다.'
};

// 스낵바 상태를 추가합니다.
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarSeverity, setSnackbarSeverity] = useState('error');

const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};

const onSubmit = async (data) => {
  console.log("요청 데이터:", data); // 데이터 확인
  try {
    const response = await axiosInstance.post(`/users/change-password`, {
      email: email,
      newPassword: data.password,
    });

    if (response.data.ok) {
      setSnackbarMessage('비밀번호가 변경되었습니다.');
      setSnackbarSeverity('success'); // 성공 상태로 변경
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/'); // 비밀번호 변경 후 페이지 이동
      }, 2000); // 2초 후 이동
    } else {
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
      setSnackbarMessage('비밀번호 변경 중 오류가 발생했습니다.');
      setSnackbarSeverity('error'); // 실패 상태로 변경
      setSnackbarOpen(true);
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
    setSnackbarMessage('비밀번호 변경 중 오류가 발생했습니다.');
    setSnackbarSeverity('error'); // 실패 상태로 변경
    setSnackbarOpen(true);
  }
};

  return (
<Box 
  sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center',
    maxWidth: 600, 
    mx: 'auto' 
  }}>
  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
    {/* 비밀번호 입력 필드 (조건부 렌더링) */}
    {view === 'changePw' && (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography 
            variant="body2" 
            component="label" 
            htmlFor="password" 
            sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}
          >
            비밀번호
          </Typography>
          <TextField
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            {...register('password', userPassword)}
            sx={{ 
              flex: 1,
              width: '400px'
             }} // 남은 공간을 채우도록 설정
            error={!!errors.password}
            helperText={errors.password ? errors.password.message : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {/* 비밀번호 확인 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="body2" 
            component="label" 
            htmlFor="passwordCheck" 
            sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}
          >
            비밀번호 확인
          </Typography>
          <TextField
            label="비밀번호 확인"
            type={showPasswordCheck ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            {...register('passwordCheck', userPasswordCheck)}
            sx={{ 
              flex: 1,
              width: '400px'
             }} // 남은 공간을 채우도록 설정
            error={!!errors.passwordCheck}
            helperText={errors.passwordCheck ? errors.passwordCheck.message : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPasswordCheck}
                    edge="end"
                  >
                    {showPasswordCheck ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <CustomButton2 
              variant="contained" 
              onClick={handleSubmit(onSubmit)}
              sx={{ mt: 2 }}
            >
              비밀번호 변경
            </CustomButton2>
            {passwordError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {passwordError}
              </Typography>
            )}
      </>
    )}
  </Box>
   {/* 스낵바 컴포넌트 호출 */}
   <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="success"
        onClose={handleSnackbarClose}
      />
</Box>
  );
};

export default MyChangePw;