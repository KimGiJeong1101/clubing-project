import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../../utils/axios';
import ClubCarousel2 from '../../../../components/club/ClubCarousel2';

const WishGroups = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [clubs, setClubs] = useState([]); // 클럽 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
      console.log('Fetching user wishes...');
      const fetchUserWishes = async () => {
        try {
          // 유저의 찜 목록을 가져오기 위한 API 호출
          const response = await axiosInstance.get('/users/myPage'); 
          const userWishes = response.data.user.wish;
  
          // 찜한 클럽 목록을 가져오기 위한 API 호출
          const clubResponses = await Promise.all(
            userWishes.map(clubId => axiosInstance.get(`/clubs/read/${clubId}`))
          );
          const clubsData = clubResponses.map(response => response.data);

          setClubs(clubsData); // 클럽 데이터 상태 업데이트
          setLoading(false); // 로딩 완료
        } catch (error) {
          console.error("Error fetching clubs:", error);
          setLoading(false); // 에러 발생 시 로딩 종료
        }
      };
  
      fetchUserWishes();
  }, [user.email]); // 의존성 배열에 user.email 추가
  return (
      <Box>
          {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                  <CircularProgress />
              </Box>
          ) : (
              <ClubCarousel2 clubList={clubs} /> // 클럽 리스트를 ClubCarousel2 컴포넌트에 전달
          )}
      </Box>
  );
};

export default WishGroups;
