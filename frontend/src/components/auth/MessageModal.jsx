import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Grid, Typography, IconButton, DialogTitle, DialogContent, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 닫기 아이콘
import { format } from 'date-fns'; // 날짜 포맷을 위한 라이브러리
import { markMessageAsRead } from '../../store/actions/myMessageActions';

const MessageModal = ({ message, onMessageRead, onClose }) => {
    const dispatch = useDispatch();
    const hasMarkedAsRead = useRef(false); // useRef로 상태 추적

    useEffect(() => {
        if (message && !message.isRead && !hasMarkedAsRead.current) {
          // 리덕스 디스패치
          dispatch(markMessageAsRead(message._id))
            .then(() => {
              if (onMessageRead) onMessageRead(message._id);
              hasMarkedAsRead.current = true; // 한 번만 실행되도록 설정
            })
            .catch(error => {
              console.error('Error updating message status:', error);
            });
        }
      }, [message, onMessageRead, dispatch]);

      useEffect(() => {
        console.log('담기는 데이터 확인:', message); // 확인용 로그
      }, [message]); // message 값이 변경될 때만 로그 찍기   

  return (
    <Dialog open={Boolean(message)} onClose={onClose} maxWidth="sm" fullWidth>
       <DialogTitle
        sx={{
            position: 'relative', // 엑스 버튼의 위치 조정을 위해 필요
            padding: '16px', // 다이얼로그 제목의 패딩 조정
        }}
      >
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 20, // 오른쪽 여백
            top: -1, // 상단 여백
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 2,
          overflowX: 'hidden', // 가로 스크롤 제거
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item sm={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2, // 간격 조정
                padding: 2,
                border: '1px solid #ddd',
                borderRadius: 2,
                backgroundColor: '#f9f9f9',
                minHeight: '300px', // 콘텐츠의 최소 높이 조정
                overflow: 'hidden', // 콘텐츠가 넘치면 숨김 처리
                width: '100%', // 가로 너비를 다 차지하도록 설정
                boxSizing: 'border-box', // 패딩과 테두리 포함
              }}
            >
              <Box
                sx={{
                  borderBottom: '0.5px solid #000',
                  paddingBottom: '2px',
                }}
              >
                <Typography sx={{ fontSize: '0.8rem' }}>
                  to : {message.sender}
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'textSecondary', mb: 1 }}>
                    {format(new Date(message.date), 'yyyy-MM-dd HH:mm')}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {message.title}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  mt: 1,
                  whiteSpace: 'normal', // 텍스트가 여러 줄로 표시되도록
                  overflow: 'hidden', // 넘치는 텍스트 숨기기
                  textOverflow: 'clip', // 텍스트가 넘치면 잘리도록
                }}
              >
                {message.content}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
