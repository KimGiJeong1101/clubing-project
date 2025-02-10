import React, { useState, useEffect }  from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
      Typography, Box, IconButton, InputAdornment, } from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import CustomButton from '../../../components/club/CustomButton'
import CustomButton2 from '../../../components/club/CustomButton2'
import CustomSnackbar from '../../../components/auth/Snackbar';

const FindPasswordPage = ({ open, onClose }) => {
  const { register, handleSubmit, watch, setError, reset, formState: { errors }, getValues } = useForm({
    mode: 'onChange', // 실시간 유효성 검사 설정
  });
  
  
  const emailValue = watch('email');
  const [isVerified, setIsVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [codeId, setCodeId] = useState(''); // 서버에서 받은 코드 ID
  const [authNumber, setAuthNumber] = useState('');
  const [timer, setTimer] = useState(0); // 타이머 상태 (초 단위)
  const [intervalId, setIntervalId] = useState(null); // 타이머 인터벌 ID
  const [hasExpired, setHasExpired] = useState(false); // 만료 여부 상태
  const [emailReadOnly, setEmailReadOnly] = useState(false); // 이메일 필드 읽기 전용 상태
  const [passwordError, setPasswordError] = useState('');

    // 이메일 유효성 검사 규칙
    const userEmail = {
      required: "필수 필드입니다.",
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "유효한 이메일 주소를 입력하세요."
      }
    };

  // API URL
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCheckDuplicate = async () => {
   if (!emailValue || emailValue.trim() === '') {
    setEmailError('이메일 주소를 입력해주세요.'); // 사용자에게 이메일 입력을 요청하는 얼럿 표시
     return; // 오류가 있을 경우 함수 실행 중지
   }
   if (errors.email) {
     // 이메일 필드에 오류가 있을 경우 얼럿을 띄움
     setEmailError('유효한 이메일 주소를 입력하세요.');
     return; // 오류가 있을 경우 함수 실행 중지
   }
   const email = emailValue;
   try {
     const response = await axios.post(`${apiUrl}/users/validate-email`, { email });

     if (response.status === 200) {
        // 이메일이 존재하면 인증 메일 발송
        console.log('인증 메일이 발송되었습니다.');
        await handleSendAuthEmail(email); // 인증 메일 발송
        setEmailError('인증 메일이 발송되었습니다.');
        setEmailReadOnly(true); // 이메일 필드를 읽기 전용으로 설정
      } else {
        setEmailError('회원 확인이 되지 않습니다.'); // 이메일이 존재하지 않는 경우
      }
    } catch (err) {
      console.error('Error occurred during email check:', err);
      setEmailError(err.response ? err.response.data.message : '서버 오류');
    }
  };

 //이메일 인증 보내기
 const handleSendAuthEmail = async () => {
  try {
      const response = await axios.post(`${apiUrl}/users/email-auth`, 
        { email: emailValue },
        { timeout: 10000 } // 타임아웃을 10초로 설정 (10000ms)
        );
      console.log('API 응답:', response.data);
      if (response.data.ok) {
        setCodeId(response.data.codeId); // 서버로부터 받은 codeId를 상태에 저장
        setAuthNumber(response.data.authNum); // 서버로부터 받은 인증번호를 상태에 저장
        // 타이머를 3분으로 설정
        setTimer(180); 
        // 이전 타이머가 있으면 클리어
        if (intervalId) {
          clearInterval(intervalId); 
          setIntervalId(null); // 이전 타이머 초기화 
        }
        // 새 타이머 시작
        const id = setInterval(() => {
          setTimer(prevTimer => {
            if (prevTimer <= 1) {
              clearInterval(id);
              setHasExpired(true); // 만료 상태 설정
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
        
        setIntervalId(id);
      } else {
          setError(response.data.msg);
      }
  } catch (err) {
    console.error('API 호출 오류:', err); // 오류 로그 추가
    setError('서버 오류');
  } 
};

// 타이머가 변경될 때 메시지 업데이트
useEffect(() => {
  if (timer > 0) {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    setEmailError(`인증번호가 전송되었습니다. [인증 기한 : ${formattedTime}]`);
  } else if (hasExpired) {
    setEmailError('인증번호가 만료되었습니다.');
  }
}, [timer, hasExpired]);

  // 인증번호 확인 핸들러
const [verificationCode, setVerificationCode] = useState('');

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post(`${apiUrl}/users/verifyAuth`, {
            codeId,
            inputCode: verificationCode,
            email: emailValue 
      });
      if (response.data.ok) {
        // 인증 성공
        setIsVerified(true); 
        setSnackbarMessage('인증에 성공하였습니다.');
        setSnackbarSeverity('success'); // 성공 상태로 변경
        setSnackbarOpen(true);
        setVerifyError(''); // 인증 성공 시 에러 메시지 초기화
        //추가
        setTimer(0); // 타이머를 0으로 설정
        setHasExpired(false); // 만료 상태 초기화
        if (intervalId) {
          clearInterval(intervalId); // 인터벌 클리어
          setIntervalId(null);
        }
    } else {
        // 인증 실패
        setVerifyError(response.data.msg);
        setSnackbarMessage('인증에 실패하였습니다.');
        setSnackbarSeverity('error'); // 실패 상태로 변경
        setSnackbarOpen(true);
    }
} catch (err) {
  console.error('인증 번호 확인 에러:', err); // 에러 확인
    setVerifyError('인증번호가 틀렸습니다.');
    setSnackbarMessage('인증번호가 틀렸습니다.');
    setSnackbarSeverity('error'); // 실패 상태로 변경
    setSnackbarOpen(true);
}
}

// 비밀번호 유효성 검사 규칙
const userPassword = {
  required: "필수 필드입니다.",
  minLength: {
    value: 8,
    message: "최소 8자입니다."
  },
  validate: value => {
    // 이메일 인증 상태가 아니면 에러 반환
    if (!isVerified) {
      return '이메일 인증을 완료해 주세요.';
    }

    // 비밀번호 형식 검증
    const regex = /^(?=.*[a-zA-Z\u3131-\uD79D])(?=.*[\W_]).{6,}$/;
    if (!regex.test(value)) {
      return '안전한 비밀번호를 위해 영문 대/소문자, 특수문자 사용해 주세요.';
    }

    return true;
  }
};

const userPasswordCheck = {
  required: '비밀번호 확인은 필수입니다.',
  minLength: {
    value: 8,
    message: "최소 8자입니다."
  },
  validate: value => {
    const newPassword = getValues('newPassword');
    
    // newPassword가 널값이거나 빈 값일 때는 비밀번호 확인 검증을 하지 않음
    if (!newPassword) {
      return '새 비밀번호를 먼저 입력해주세요';
    }
    
    // 비밀번호가 일치하지 않으면 에러 메시지 반환
    if (value !== newPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    
    return true;
  }
};

  // 비밀번호 변경 핸들러
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${apiUrl}/users/change-password`, {
        email: data.email,
        newPassword: data.newPassword,
      });

      if (response.data.ok) {
        setSnackbarMessage('비밀번호가 성공적으로 변경되었습니다.');
        setSnackbarSeverity('success'); // 성공 상태로 변경
        setSnackbarOpen(true);
        setTimeout(() => {
          onClose(); // 창 닫기
          handleReset(); // 폼 필드 리셋
        }, 1000); // 스낵바 표시 시간과 일치하도록 설정
      } else {
        setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowPasswordCheck = () => setShowPasswordCheck(!showPasswordCheck);


  // 일단 이렇게 일일이 리셋하는데 다른 방법이 있을 듯
  const handleReset = () => {
    reset({
      email: '',               // 이메일 필드 초기화
      newPassword: '',         // 새 비밀번호 필드 초기화
      confirmPassword: '',    // 비밀번호 확인 필드 초기화
    }); // 폼 데이터 리셋
    setIsVerified(false); // 인증 상태 초기화
    setEmailError(''); // 이메일 오류 초기화
    setVerifyError(''); // 인증 오류 초기화
    setCodeId(''); // 코드 ID 초기화
    setAuthNumber(''); // 인증 번호 초기화
    setTimer(0); // 타이머 초기화
    setHasExpired(false); // 만료 상태 초기화
    setEmailReadOnly(false); // 이메일 필드 읽기 전용 상태 초기화
    setVerificationCode(''); // 인증 번호 상태 초기화
    setPasswordError('')
    setShowPassword(false); // 비밀번호 표시 상태 초기화
    setShowPasswordCheck(false); // 비밀번호 확인 표시 상태 초기화
  if (intervalId) {
    clearInterval(intervalId); // 타이머 클리어
    setIntervalId(null);
  }
  };

  // 스낵바 상태를 추가합니다.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => { handleReset(); onClose(); }}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: 480, // 최대 너비를 450px로 설정
          borderRadius: 5, // 테두리 반경을 5px로 설정
        },
      }}// 최대 너비 설정
    >  
       <DialogTitle
        sx={{ mt: 2, }} // 상단 마진과 하단 마진, 폰트 크기 설정
      >
        비밀번호 변경</DialogTitle>
      <DialogContent
        sx={{ padding: 0, mt:2 }}>
      <Box
          sx={{
            width: '100%',
            maxWidth:400, // 최대 너비 설정
            margin: ' auto', // 수평 중앙 정렬
            bgcolor: 'background.paper',
          }}
        >
              <>
                <Typography variant="body2" component="label" htmlFor="email" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  이메일
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb:2}}>
                <TextField
                    label="이메일"
                    type="email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...register('email', userEmail )}
                    sx={{
                      flex: 1,
                      mr: 1,
                      bgcolor: emailReadOnly ? 'grey.200' : 'white', // 읽기 전용일 때 배경 색상 변경
                      '& .MuiInputBase-input': {
                        color: emailReadOnly ? 'text.disabled' : 'text.primary', // 읽기 전용일 때 텍스트 색상 변경
                      },
                      boxSizing: 'border-box', // 패딩이 높이에 영향을 미치지 않도록
                    }}
                    InputProps={{
                      readOnly: emailReadOnly, // 인증 완료 시 이메일 필드를 읽기 전용으로 설정
                    }}
                    FormHelperTextProps={{
                      sx: {
                        color: 'error.main', // 오류 메시지 색상
                      },
                    }}
                    error={!!emailError || !!errors.email} // 이메일 필드에 에러가 있거나 인증 오류가 있는 경우
                  />
                  <CustomButton 
                    variant="contained"
                    sx={{ height: '56px', lineHeight: '56px',  }}
                    onClick={handleCheckDuplicate} // 이메일 중복 체크 및 인증 메일 발송
                  >
                    인증하기
                  </CustomButton>
                </Box>
                {emailError && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {emailError}
                </Typography>
              )}
              </>
      <Box sx={{ mb: 2 }}>
      <Typography variant="body2" component="label" htmlFor="verification" 
      sx={{ 
        fontWeight: 'bold', 
        color: 'text.secondary' ,
        }}>
        인증번호
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          label="인증번호"
          type="text"
          id="verification"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          fullWidth
          sx={{
            flex: 1,
            mr: 1,
            bgcolor: isVerified ? 'grey.200' : 'white',
            '& .MuiInputBase-input': {
              color: isVerified ? 'text.disabled' : 'text.primary',
            },
            boxSizing: 'border-box', // 패딩이 높이에 영향을 미치지 않도록
          }}
          InputProps={{
            readOnly: isVerified,
          }}
        />
        <CustomButton
          variant="contained"
          color={isVerified ? 'grey' : 'primary'}
          onClick={handleVerifyClick}
          disabled={isVerified}
          sx={{ minHeight: '50px' }} // 버튼의 최소 높이를 설정하여 텍스트 필드와 높이를 맞춤
        >
          {isVerified ? '인증확인' : '인증완료'}
        </CustomButton>
      </Box>
      {verifyError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {verifyError}
        </Typography>
      )}
    </Box>
    <Box sx={{ mt: 4 }}>
      <Typography variant="body2" component="label" htmlFor="verification" 
      sx={{ fontWeight: 'bold', color: 'text.secondary', }}>
        새 비밀번호
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb:2 }}>
      <TextField
            label="새 비밀번호"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            variant="outlined"
            {...register('newPassword', userPassword)}
            error={!!errors.newPassword || !!passwordError}
            helperText={errors.newPassword?.message || passwordError}
            sx={{
              flex: 1,
              mr: 1,
              bgcolor: !isVerified ? 'grey.200' : 'white',
              '& .MuiInputBase-input': {
                color: !isVerified ? 'text.disabled' : 'text.primary',
              },
              boxSizing: 'border-box',
            }}
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
           </Box>  
        <Box>  
        <Typography variant="body2" component="label" htmlFor="verification" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          새 비밀번호 확인
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb:4 }}>
        <TextField
            label="새 비밀번호 확인"
            type={showPasswordCheck ? 'text' : 'password'}
            fullWidth
            margin="normal"
            variant="outlined"
            {...register('confirmPassword', userPasswordCheck)}
            error={!!errors.confirmPassword || !!passwordError}
            helperText={errors.confirmPassword?.message || passwordError}
            sx={{
              flex: 1,
              mr: 1,
              bgcolor: !isVerified ? 'grey.200' : 'white',
              '& .MuiInputBase-input': {
                color: !isVerified ? 'text.disabled' : 'text.primary',
              },
              boxSizing: 'border-box',
            }}
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
          </Box> 
        </Box>
      </DialogContent>
      <DialogActions>
      <CustomButton2 onClick={handleSubmit(onSubmit)} 
        sx={{
          mb: 3,
        }}
      >
          비밀번호 변경
        </CustomButton2>
      <CustomButton onClick={() => { handleReset(); onClose(); }} 
        sx={{
          mb: 3,
          mr: 3,
        }}
        >
          취소
        </CustomButton>
      </DialogActions>

      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="success"
        onClose={handleSnackbarClose}
      />

    </Dialog>
  );
};

export default FindPasswordPage;
