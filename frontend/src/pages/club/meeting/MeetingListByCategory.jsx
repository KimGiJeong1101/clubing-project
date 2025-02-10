import { Avatar, AvatarGroup, Grid, Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { useSelector } from "react-redux";

const MeetingListByCategory = ({ passCategory }) => {
  const navigate = useNavigate();
  const [moreMeetingListCount, setMoreMeetingListCount] = useState(0);
  const [moreMeetingList, setMoreMeetingList] = useState([]);
  const moreMeetingListHandler = () => {
    setMoreMeetingListCount((prev) => prev + 1); // 상태 업데이트 반환
  };
  const user = useSelector((state) => state.user);

  const getCategoryMeetingList = async () => {
    const response = await axiosInstance.get(`/meetings/category/${passCategory}`);
    const data = await response.data;
    setMoreMeetingListCount(0);
    setMoreMeetingList([]);
    return data;
  };

  const fetchMeetings = async () => {
    try {
      const response = await axiosInstance.get(`/meetings/category/${passCategory}?count=${moreMeetingListCount}`);
      const data = await response.data;
      console.log(`data`);
      console.log(data);
      console.log(`data`);
      // 이전 리스트에 새로운 데이터를 추가
      setMoreMeetingList((prev) => [...prev, ...data]); // 비동기 결과 처리
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };
  useEffect(() => {
    if (moreMeetingListCount !== 0) {
      fetchMeetings(); // 비동기 함수 호출
      console.log(`moreMeetingListCount`);
      console.log(moreMeetingListCount);
    }
  }, [moreMeetingListCount]); // moreMeetingListCount가 변경될 때마다 실행됨
  const {
    data: categoryMeetingList,
    error,
    isLoading,
    isError,
    isFetching, // isFetching 사용
  } = useQuery({
    queryKey: ["categoryMeetingList", passCategory],
    queryFn: getCategoryMeetingList,
    keepPreviousData: true, // 이전 데이터를 유지
  });
  if (isLoading && !isFetching) {
    return <div>로딩 중...</div>; // 최초 로딩 시
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <Box>
      <Container maxWidth="lg" sx={{ backgroundColor: "#f2f2f2", padding: "20px", borderRadius: "30px" }}>
        <Grid container spacing={3} sx={{ marginBottom: "30px" }}>
          {categoryMeetingList &&
            categoryMeetingList.slice(0, 4).map((meeting, index) => {
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
          {(!categoryMeetingList || categoryMeetingList.length === 0) && (
            <Grid item xs={12} sx={{ borderRadius: "30px", height: "200px", width: "100%", backgroundColor: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              선택하신 카테고리의 정기모임이 없습니다.
            </Grid>
          )}
        </Grid>
        {/* 더보기 후 불러오는 모임리스트 4개씩 */}
        <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
          {moreMeetingList &&
            moreMeetingList.slice(0, moreMeetingListCount * 4).map((meeting, index) => {
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
                    transition: "all 0.3s ease", // 부드러운 전환 효과 추가
                    "&:hover": {
                      // 호버 스타일 추가
                      backgroundColor: "#f0f0f0", // 호버 시 배경색 변경
                      transform: "scale(1.01)", // 호버 시 살짝 확대
                    },
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
        </Grid>
        {/* 더보기 후 불러오는 모임리스트 4개씩.end */}
        {/* 미팅리스트 길이가 5일떄 -> 즉 더보기 눌러도 가져올 정보가 더 있을 때 버튼 보여주기 */}
        {moreMeetingListCount === 0 && categoryMeetingList && categoryMeetingList.length === 5 && (
          <Typography
            variant={"h6"}
            onClick={moreMeetingListHandler}
            sx={{
              color: "#A6836F",
              background: "white",
              textAlign: "center",
              borderRadius: "30px",
              width: "100%",
              height: "50px",
              display: "flex", // 플렉스 박스 사용
              alignItems: "center", // 수직 중앙 정렬
              justifyContent: "center", // 수평 중앙 정렬
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // 기본 그림자
              transition: "all 0.3s ease", // 애니메이션 효과
              "&:hover": {
                backgroundColor: "#A6836F", // 호버 시 배경색 변경
                color: "white", // 호버 시 글자색 변경
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // 호버 시 그림자 강화
                cursor: "pointer",
              },
            }}
          >
            더보기
          </Typography>
        )}
        {/* 미팅리스트 길이가 5일떄 -> 즉 더보기 눌러도 가져올 정보가 더 있을 때 버튼 보여주기.end */}

        {/* 더보기한 후 미팅리스트 길이가 5일떄 -> 즉 더보기 눌러도 가져올 정보가 더 있을 때 버튼 보여주기 */}
        {moreMeetingList && moreMeetingList.length === 5 && (
          <Typography
            variant={"h6"}
            onClick={moreMeetingListHandler}
            sx={{
              color: "#A6836F",
              background: "white",
              textAlign: "center",
              borderRadius: "30px",
              width: "100%",
              height: "50px",
              display: "flex", // 플렉스 박스 사용
              alignItems: "center", // 수직 중앙 정렬
              justifyContent: "center", // 수평 중앙 정렬
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // 기본 그림자
              transition: "all 0.3s ease", // 애니메이션 효과
              "&:hover": {
                backgroundColor: "#A6836F", // 호버 시 배경색 변경
                color: "white", // 호버 시 글자색 변경
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // 호버 시 그림자 강화
                cursor: "pointer",
              },
            }}
          >
            더보기
          </Typography>
        )}
        {/* 더보기한 후 미팅리스트 5일떄 -> 즉 더보기 눌러도 가져올 정보가 더 있을 때 버튼 보여주기.end */}
      </Container>
    </Box>
  );
};

export default MeetingListByCategory;
