import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Modal, Grid, } from '@mui/material';
import { logoutUser } from '../../../../store/actions/userActions';
import axiosInstance from '../../../../utils/axios';
import CustomSnackbar from '../../../../components/auth/Snackbar';

const MyCancelAccount = ({ view }) => {  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // 스낵바 상태를 추가합니다.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

    const handleSnackbarClose = () => {
      setSnackbarOpen(false);
    };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete('/users/myPage/delete');
      console.log('회원 탈퇴 요청이 전송되었습니다.', response.data);
      setSnackbarMessage('회원 탈퇴가 완료되었습니다.');
      setSnackbarSeverity('success'); // 성공 상태로 변경
      setSnackbarOpen(true);

    // 스낵바가 표시된 후 3초 뒤에 로그아웃 및 페이지 이동
    setTimeout(async () => {
      try {
        await axiosInstance.post('/users/logout');
        dispatch(logoutUser());
        navigate('/'); // 페이지 이동
      } catch (logoutError) {
        console.error('로그아웃 중 오류 발생:', logoutError);
        setSnackbarMessage('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }, 2000); // 2초 후 로그아웃 요청 및 페이지 이동
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      setSnackbarMessage('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSnackbarSeverity('error'); // 실패 상태로 변경
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // 모달 닫기
  };

  return (
    <Box 
      sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          mx: 'auto',
          width: '100%',  
          maxWidth: '600px'
          }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', }}>

        {/* view 상태에 따른 렌더링 */}
        {view === 'delete' && (
          <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ mt: 1 , mb: 1}}>
              <Typography variant="body1" align="center" mb={4}>
                회원 탈퇴를 진행하시겠습니까?
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAccount}
                sx={{ width: '100%', 
                  px: 4, 
                  py: 2, 
                  borderRadius: '8px' }}
              >
                탈퇴하기
              </Button>
            </Box>
          </Box>
        )}

        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2" align="center">
              정말로 회원 탈퇴를 하시겠습니까?
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCloseModal}
                >
                  취소
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleConfirmDelete}
                >
                  탈퇴하기
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      {/* 스낵바 컴포넌트 호출 */}
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="success"
        onClose={handleSnackbarClose}
      />
      </Box>
    </Box>
  );
};

export default MyCancelAccount;
