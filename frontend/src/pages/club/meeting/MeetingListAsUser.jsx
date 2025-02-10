/** @jsxImportSource @emotion/react */
import { Avatar, AvatarGroup, Grid, Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React from "react";
import axiosInstance from "../../../utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { useSelector } from "react-redux";
import RefreshIcon from "@mui/icons-material/Refresh";
import { keyframes } from "@emotion/react";

const MeetingListAsUser = () => {
  const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const getMeetingListAsUser = async () => {
    const response = await axiosInstance.get(`/meetings/suggestForUser`);
    const data = await response.data;
    return data;
  };

  const refreshHandler = () => {
    getMeetingListAsUser();
    refetch();
  };

  const {
    data: meetingListAsUser,
    error,
    isLoading,
    isError,
    isFetching, // isFetching 사용
    refetch,
  } = useQuery({
    queryKey: ["meetingListAsUser"],
    queryFn: getMeetingListAsUser,
    keepPreviousData: true, // 이전 데이터를 유지
    staleTime: 0, // 데이터를 항상 신선하다고 간주
    cacheTime: 0, // 데이터를 캐시하지 않음
  });
  if (isLoading && !isFetching) {
    return <div>로딩 중...</div>; // 최초 로딩 시
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <Box>
      <Container
        sx={{
          width: "100%",
          height: "100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "white",
          marginTop: "20px",
        }}
      >
        {/* 카테고리텝 */}
        <Grid container spacing={0} sx={{ BottomMargin: "0px" }}>
          <Grid item xs={10}>
            <Box sx={{ fontSize: "25px", fontWeight: "600", BottomMargin: "5px" }}>
              맞춤 추천 모임<span style={{ fontSize: "20px", fontWeight: "550", color: "#A6836F" }}> - 선택한 카테고리 위주로 추천해드려요</span>
            </Box>
          </Grid>
          <Grid
            item
            xs={2}
            onClick={refreshHandler}
            sx={{
              fontSize: "20px",
              fontWeight: 550,
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.3s ease", // 부드러운 크기 변화
              "&:hover": {
                transform: "scale(1.1)", // 호버 시 크기 증가
              },
            }}
          >
            추천 새로고침
            <RefreshIcon
              css={{
                marginLeft: "8px",
                animation: `${spin} 5s linear infinite`,
              }}
            />
          </Grid>
        </Grid>
        {/* 카테고리텝.end */}
      </Container>
      <Container maxWidth="lg" sx={{ backgroundColor: "#f2f2f2", padding: "20px", borderRadius: "30px" }}>
        <Grid container spacing={3} sx={{ marginBottom: "30px" }}>
          {meetingListAsUser &&
            meetingListAsUser.slice(0, 6).map((meeting, index) => {
              const avatars = meeting?.joinMemberInfo.map((member, idx) => <Avatar key={idx} alt={member.img} src={member.thumbnailImage} sx={{ width: 32, height: 32 }} />);
              return (
                <Grid
                  item
                  xs={6}
                  sm={6}
                  md={6}
                  key={index}
                  onClick={() => {
                    navigate(`/clubs/main?clubNumber=${meeting.clubNumber}`);
                  }}
                  sx={{
                    height: "200px",
                    marginBottom: "10px",
                    cursor: "pointer", // 커서 포인터 추가
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      padding: "16px",
                      display: "flex",
                      borderRadius: "20px",
                      transition: "all 0.3s ease", // 부드러운 전환 효과 추가
                      "&:hover": {
                        // 호버 스타일 추가
                        transform: "scale(1.02)", // 호버 시 살짝 확대
                      },
                    }}
                  >
                    <Grid item xs={12} sm={12} md={4}>
                      <Box
                        sx={{
                          width: "160px",
                          height: "160px",
                          overflow: "hidden", // 박스 영역을 넘어서는 이미지 잘리기
                          borderRadius: "20px", // 원하는 경우 둥근 모서리 적용
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f0f0", // 박스 배경 색상 (선택 사항)
                        }}
                      >
                        <img
                          src={`http://localhost:4000/` + meeting.img} // 이미지 경로
                          alt="Example222"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // 박스 크기에 맞게 이미지 잘리기
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "700",
                          fontSize: "22px",
                          color: "#383535",
                        }}
                      >
                        {meeting.title}
                      </Typography>
                      <Box sx={{ margin: "4px" }}>일시 : {meeting.dateTime}</Box>
                      <Box sx={{ margin: "4px" }}>위치 : {meeting.where}</Box>
                      <Box sx={{ margin: "4px" }}>비용 : {meeting.cost}</Box>

                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center", // 수직 중앙 정렬
                          margin: "10px 0px",
                        }}
                      >
                        <AvatarGroup max={4}>{avatars}</AvatarGroup>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "8px",
                          }}
                        >
                          <PeopleRoundedIcon sx={{ fontSize: "18px" }} />
                          <span style={{ marginLeft: "5px" }}>
                            {meeting?.joinMember?.length}/{meeting?.totalCount}
                          </span>
                        </Box>
                      </Box>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}

          {user.userData.user.email !== "" && (!meetingListAsUser || meetingListAsUser.length === 0) && (
            <Grid item xs={12} sx={{ borderRadius: "30px", height: "200px", width: "100%", backgroundColor: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              정보가 부족합니다. 회원정보에서 정보를 추가해주세요.
            </Grid>
          )}
          {user.userData.user.email === "" && (
            <Grid item xs={12} sx={{ borderRadius: "30px", height: "200px", width: "100%", backgroundColor: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              로그인 정보가 없습니다.
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default MeetingListAsUser;
