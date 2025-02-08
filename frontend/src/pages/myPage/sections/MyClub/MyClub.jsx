import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import InvitedGroups from './InvitedGroups'
import MyGroups from './MyGroups'
import { useSelector } from 'react-redux';
import RecentGroups from './RecentGroups'
import WishGroups from './WishGroups'
import axiosInstance from '../../../../utils/axios';

const MyClub = () => {
  // 클릭된 항목을 추적하는 상태
  const [activeItem, setActiveItem] = useState('myGroups');
  const [counts, setCounts] = useState({
    myGroups: 0,
    wishGroups: 0,
    recentGroups: 0,
    invitedGroups: 0,
  });

  const user = useSelector((state) => state.user?.userData?.user || {});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosInstance.get('/users/myPage'); 
        const { counts } = response.data; // 서버 응답에서 counts를 추출
        setCounts(counts); // 상태 업데이트
         // recentGroups 카운트를 별도로 요청
        const Response = await axiosInstance.get(`/users/recentvisit/${user.email}`);
        const RecentVisitList = Response.data.RecentVisitList;
        const RecentClubs = RecentVisitList.length > 0 ? RecentVisitList[0].clubCount : 0;
      // recentGroups를 업데이트
      setCounts(prevCounts => ({
        ...prevCounts,
        recentGroups : RecentClubs
      }));

      } catch (error) {
        console.error('Error fetching group counts:', error);
      }
    };
    fetchCounts();
  }, []); // 빈 배열을 의존성 배열로 설정

  // 항목 클릭 핸들러
  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* 내 정보 리스트 */}
      <Box
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', // 버튼 사이에 동일한 간격을 줍니다.
          mb: 0, // 마진을 없애서 경계 제거
          borderBottom: '1px solid #ddd', // 버튼과 콘텐츠 사이에 경계선 추가 (선택 사항)
        }}
      >
        {/* 컨텐츠 순서 */}
        {['myGroups', 'wishGroups', 'recentGroups', 'invitedGroups'].map((item) => (
          <Box
            key={item}
            sx={{ 
              flex: 1, // 각 버튼이 동일한 비율로 차지하도록 설정
              textAlign: 'center', 
              cursor: 'pointer', 
              position: 'relative', // 밑줄을 절대 위치로 설정하기 위해
              p: 3, 
              borderRadius: 2,
              transition: 'background-color 0.3s, transform 0.3s',
              backgroundColor: activeItem === item ? '#e0e0e0' : 'transparent',
              transform: activeItem === item ? 'scale(1.05)' : 'scale(1)',
              '&:hover': {
                backgroundColor: activeItem !== item ? '#f0f0f0' : 'transparent', // 클릭되지 않은 항목만 호버 효과
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: activeItem === item ? '70%' : '0%', // 클릭된 버튼만 밑줄을 가득 채우도록 설정
                height: '3px',
                backgroundColor: '#40190B', // 밑줄 색상
                transform: 'translateX(-50%)', // 가운데 정렬
                transition: 'width 0.3s ease',
              }
            }}
            onClick={() => handleItemClick(item)}
          >
            <Typography variant="body1">
              {item === 'myGroups' && '내 모임'}
              {item === 'wishGroups' && '찜 모임'}
              {item === 'recentGroups' && '최근 방문한 모임'}
              {item === 'invitedGroups' && '초대받은 모임'}
            </Typography>
            <Typography variant="body2">
              {item === 'myGroups' && counts.myGroups}
              {item === 'wishGroups' && counts.wishGroups}
              {item === 'recentGroups' && counts.recentGroups}
              {item === 'invitedGroups' && counts.inviteGroups}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 콘텐츠 영역 */}
      <Box
        sx={{
          p: 3,
          bgcolor: activeItem ? '#e0e0e0' : 'white', // activeItem이 있는 경우 회색으로 변경
          borderRadius: 2,
          boxShadow: 3,
          transition: 'background-color 0.3s ease',
        }}
      >
        {activeItem === 'myGroups' && (
        <MyGroups />
        )}
        {activeItem === 'wishGroups' && (
         <WishGroups />
        )}
         {activeItem === 'invitedGroups' && (
          <InvitedGroups />
        )}
        {activeItem === 'recentGroups' && (
         <RecentGroups />
        )}
      </Box>
    </Box>
  );
}

export default MyClub;
