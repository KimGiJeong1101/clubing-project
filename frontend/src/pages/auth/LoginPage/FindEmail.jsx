import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, InputAdornment } from '@mui/material';
import Phone from '@mui/icons-material/Phone';
import axiosInstance from '../../../utils/axios';
import CustomButton from '../../../components/club/CustomButton'
import CustomButton2 from '../../../components/club/CustomButton2'

const FindEmailPage = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [emails, setEmails] = React.useState([]);
  const [error, setError] = React.useState('');

  const handleFindEmail = async () => {
    try {
      // 전화번호를 이용해 이메일 조회 요청
      const response = await axiosInstance.post('/users/findEmail', {
        phone: phoneNumber
      });
  
      if (response.status === 200) {
        // 이메일 주소를 상태에 저장
        setEmails([response.data.email]);
        setError(''); // 오류 메시지 초기화
      } else {
        // 서버에서 보낸 오류 메시지를 사용자에게 알림
        alert(response.data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      if (error.response) {
        // 서버에서 응답을 받았을 때
        if (error.response.status === 404) {
            setError('전화번호로 조회되는 아이디가 없습니다.'); // DB에 이메일이 없는 경우
            setEmails([]); // 이메일 상태 초기화
        } else if (error.response.status === 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'); // 서버 오류
        } else {
          alert('알 수 없는 오류가 발생했습니다.'); // 기타 서버 오류
        }
      } else {
        // 네트워크 오류 등
        alert('이메일 조회 중 네트워크 오류가 발생했습니다.'); // 네트워크 오류
      }
      //console.error('이메일 조회 실패:', error);
    }
  };
  // 전화번호 하이픈  자동생성
const formatPhoneNumber = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
  
    // 하이픈 추가
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };
  
  const handlePhoneNumberChange = (event) => {
    const { value } = event.target;
    const formattedValue = formatPhoneNumber(event.target.value);
    setPhoneNumber(formattedValue);

     // 숫자만 허용, 그렇지 않으면 오류 메시지 설정
     const isValid = /^[0-9-]*$/.test(value); // 하이픈 포함 숫자만 허용
     if (!isValid) {
       setError('전화번호는 숫자만 입력 가능합니다.');
     } else {
       setError('');
     }
  };

    // 모달 닫을 때 전화번호 상태 리셋
    const handleClose = () => {
        setPhoneNumber('');
        setEmails([]);
        setError('');
        onClose();
      };
    
// 엔터키 감지 및 조회 함수 호출
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // 폼 제출 방지 (기본 동작)
      handleFindEmail();
    }
  };

   // 이메일 마스킹 함수
   const maskEmail = (email) => {
    const [localPart, domainPart] = email.split('@');
    if (!domainPart) return email; // '@'가 없는 경우 원본 반환
  
    // 로컬 부분을 마스킹
    const maskedLocalPart = localPart.slice(0, 4) + '****';
    return `${maskedLocalPart}@${domainPart}`;
  };

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
            sx: {
            width: '450px',
            maxWidth: '100%',
            height: 'auto', // 기본 높이를 auto로 설정
            maxHeight: '100vh', // 최대 높이를 뷰포트의 80%로 설정
            backgroundColor: 'background.paper',
            boxShadow: 24, // 그림자 추가
            overflowY: 'auto', // 콘텐츠가 넘칠 경우 스크롤 표시
            borderRadius: 5,
            },
        }}
        >
      <DialogTitle 
      sx={{ 
        fontWeight: 'bold' ,
        mt: 3,
        mb: 2,
        ml: 2
        }}>
          아이디 찾기</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column', // 세로 방향으로 요소 배치
          alignItems: 'center',    // 가로 방향으로 중앙 정렬
        }}
      >
        <TextField
          fullWidth
          label="전화번호"
          margin="normal"
          variant="outlined"
          value={phoneNumber}
          onChange={handlePhoneNumberChange} // 전화번호 변경 핸들러 추가
          onKeyDown={handleKeyDown}
          sx={{
            width: '90%',
            mb: 3,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone style={{ color: 'gray' }} />
              </InputAdornment>
            ),
          }}
          error={Boolean(error)} // 오류 상태에 따라 텍스트 필드의 오류 스타일 적용
        />
        {emails.length > 0 && (
          <Box mt={2} mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>조회된 이메일 주소:</Typography>
            <ul style={{ paddingLeft: '16px', margin: 0 }}>
              {emails.map((email, index) => (
                <li key={index} style={{ margin: '4px 0' }}>{maskEmail(email)}</li>
              ))}
            </ul>
          </Box>
        )}
        {error && (
          <Box mt={2}>
            <Typography color="error" variant="body1" sx={{ fontWeight: 'bold' }}>{error}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <CustomButton2 onClick={handleFindEmail} color="primary" variant="outlined"
         sx={{
          borderColor: 'transparent', // 무색 테두리
          mb: 3,
          '&:hover': {
            borderColor: 'transparent', // 무색 테두리
          },
        }}
        >
          조회
        </CustomButton2>
        <CustomButton onClick={handleClose} color="primary" variant="outlined"
         sx={{
          borderColor: 'transparent', // 무색 테두리
          mb: 3,
          mr: 3,
          '&:hover': {
            borderColor: 'transparent', // 무색 테두리
          },
        }}
        >
          닫기
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};


export default FindEmailPage;
