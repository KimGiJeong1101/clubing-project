import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import UnreadMessages from './UnreadMessages'
import ReadMessages from './ReadMessages'
import { useSelector } from 'react-redux';
import axiosInstance from '../../../../utils/axios';

const MyMessage = () => {
  const [activeTab, setActiveTab] = useState('unreadMessages');
  const [messages, setMessages] = useState({
    readCount: 0,
    unreadCount: 0
  });

  // 클릭 핸들러
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const user = useSelector((state) => state.user?.userData?.user || {});

  useEffect(() => {
    if (user.email) { // user.email이 있을 경우에만 요청
      axiosInstance.get(`/users/messages/counts/${user.email}`)
      .then(response => {
        setMessages(response.data);
      })
        .catch(error => 
          console.error('Error fetching messages:', error));
    }
  }, [messages]);

  return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* 메시지 탭 버튼 */}
        <Box
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', // 버튼 사이에 동일한 간격을 줍니다.
            mb: 0, // 마진을 없애서 경계 제거
            borderBottom: '1px solid #ddd', // 버튼과 콘텐츠 사이에 경계선 추가
          }}
        >
          {['unreadMessages', 'readMessages'].map((tab) => (
            <Box
              key={tab}
              sx={{ 
                flex: 1, // 각 버튼이 동일한 비율로 차지하도록 설정
                textAlign: 'center', 
                cursor: 'pointer', 
                position: 'relative', // 밑줄을 절대 위치로 설정하기 위해
                p: 3, 
                borderRadius: 2,
                transition: 'background-color 0.3s, transform 0.3s',
                backgroundColor: activeTab === tab ? '#e0e0e0' : 'transparent',
                transform: activeTab === tab ? 'scale(1.05)' : 'scale(1)',
                '&:hover': {
                  backgroundColor: activeTab !== tab ? '#f0f0f0' : 'transparent', // 클릭되지 않은 항목만 호버 효과
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: activeTab === tab ? '70%' : '0%', // 클릭된 버튼만 밑줄을 가득 채우도록 설정
                  height: '3px',
                  backgroundColor: '#40190B', // 밑줄 색상
                  transform: 'translateX(-50%)', // 가운데 정렬
                  transition: 'width 0.3s ease',
                }
              }}
              onClick={() => handleTabClick(tab)}
            >
              <Typography variant="body1">
                {tab === 'unreadMessages' && '안 읽음'}
                {tab === 'readMessages' && '읽음'}
              </Typography>
              <Typography variant="body2">
                {tab === 'unreadMessages' && messages.unreadCount}
                {tab === 'readMessages' && messages.readCount}
              </Typography>
            </Box>
          ))}
        </Box>
  
        {/* 콘텐츠 영역 */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#e0e0e0', // 콘텐츠 영역 배경색
            borderRadius: 2,
            boxShadow: 3,
            transition: 'background-color 0.3s ease',
          }}
        >
          {activeTab === 'unreadMessages' && (
            <UnreadMessages />
          )}
          {activeTab === 'readMessages' && (
            <ReadMessages />
          )}
        </Box>
      </Box>
  )
}

export default MyMessage