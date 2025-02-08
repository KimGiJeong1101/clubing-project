import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const CustomSnackbarWithTimer = ({ open, message, severity = 'success', onClose, duration = 5000 }) => {
  const [remainingTime, setRemainingTime] = useState(duration / 1000); // 남은 시간을 초로 표시

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(interval); // 컴포넌트가 unmount 될 때 타이머 클리어
    } else {
      setRemainingTime(duration / 1000); // 스낵바가 닫힐 때 남은 시간을 초기화
    }
  }, [open, duration]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // 위치 설정
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message} (남은 시간: {remainingTime}초)
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbarWithTimer;
