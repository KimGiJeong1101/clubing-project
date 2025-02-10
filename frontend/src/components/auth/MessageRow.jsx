import React from 'react';
import { Box, Grid, Typography, TableCell } from '@mui/material';
import CustomCheckbox from '../club/CustomCheckbox'; // CustomCheckbox 컴포넌트 경로
import { format } from 'date-fns'; // 날짜 포맷을 위한 라이브러리

const MessageRow = ({ message, selectedMessages, handleReadMessage  }) => {
  
  const handleCheckboxClick = (event) => {
    // 클릭 이벤트 전파를 막지 않음
    event.stopPropagation(); // 메시지 클릭 시 모달이 열리지 않도록 설정
    handleReadMessage(message._id);
  };

    return (
    <TableCell sx={{ padding: '15px' }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomCheckbox
            checked={selectedMessages.includes(message._id)}
            onClick={handleCheckboxClick}
          />
        </Grid>
        <Grid item xs={11} >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              padding: 2,
              border: '1px solid #ddd',
              borderRadius: 2,
              backgroundColor: '#f9f9f9',
              minHeight: '100px'
            }}
          >
            <Box
              sx={{
                borderBottom: '0.5px solid #000',
                paddingBottom: '2px'
              }}
            >
              <Typography sx={{ fontSize: '0.7rem' }}>
              From : {message.sender}
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'textSecondary', mb: 1 }}>
                  {format(new Date(message.date), 'yyyy-MM-dd HH:mm')}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                {message.title}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '1rem',
                mt: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',// 텍스트가 넘칠 때 숨기기
                textOverflow: 'ellipsis' // 넘치는 텍스트에 줄임표 추가
              }}
            >
              {message.content}
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: message.isRead ? 'textPrimary' : 'error.main'
                }}
              >
                {message.isRead ? '읽음' : '안 읽음'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </TableCell>
  );
};

export default MessageRow;
