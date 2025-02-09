import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material"; // Typography 추가
import { useSelector } from "react-redux";
import axiosInstance from "../../../../utils/axios";
import ClubCarousel4 from "../../../../components/club/ClubCarousel4";

// 사용자 정보 가져오기

const fetchUserByEmail = async (email) => {
  try {
    console.log(`Fetching user data for email: ${email}`);
    const response = await axiosInstance.get(`/users/email/${email}`);
    console.log(`User data fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { _id: "", name: "Unknown", profilePic: "", nickName: "" }; // 기본값 설정
  }
};

const MyChatList = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [clubs, setClubs] = useState([]); // 클럽 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    // 사용자 클럽 데이터를 가져오는 API 요청
    const fetchUserClubs = async () => {
      try {
        console.log("Fetching user clubs for user:", user);
        // 유저의 클럽 데이터를 가져오기 위한 API 호출
        const response = await axiosInstance.get("/users/myPage");
        console.log("User clubs data fetched:", response.data);
        const userClubs = response.data.user.clubs;

        // 클럽 목록을 가져오기 위한 API 호출
        const clubResponses = await Promise.all(
          userClubs.map((clubId) => {
            console.log(`Fetching club data for clubId: ${clubId}`);
            return axiosInstance.get(`/clubs/read/${clubId}`);
          }),
        );
        let clubsData = clubResponses.map((response) => response.data);
        console.log("Club data fetched:", clubsData);

        // 각 클럽 멤버들의 프로필 정보를 불러오는 과정
        clubsData = await Promise.all(
          clubsData.map(async (club) => {
            console.log(`Fetching members info for club: ${club.title}`);
            const memberInfo = await Promise.all(club.members.map((memberId) => fetchUserByEmail(memberId)));
            console.log(`Members info fetched for club: ${club.title}`, memberInfo);
            return { ...club, memberInfo }; // 멤버 프로필 정보를 club 데이터에 추가
          }),
        );

        console.log("Final clubs data with member info:", clubsData);
        setClubs(clubsData); // 클럽 데이터 상태 업데이트
        setLoading(false); // 로딩 완료
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setError("클럽 데이터를 불러오는 데 실패했습니다."); // 에러 메시지 상태 업데이트
        setLoading(false); // 에러 발생 시 로딩 종료
      }
    };

    fetchUserClubs();
  }, [user.email]); // 의존성 배열에 user.email 추가

  return (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : error ? ( // 에러가 있는 경우
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6" color="error">
            {error}
          </Typography>{" "}
          {/* 에러 메시지 표시 */}
        </Box>
      ) : (
        <ClubCarousel4 clubList={clubs} /> // 클럽 리스트를 ClubCarousel2 컴포넌트에 전달
      )}
    </Box>
  );
};

export default MyChatList;
