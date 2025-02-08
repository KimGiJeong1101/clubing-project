import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BubbleAnimation from "../../components/club/BubbleAnimation.js";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NightlifeIcon from "@mui/icons-material/Nightlife";
import RowingIcon from "@mui/icons-material/Rowing";
import CelebrationIcon from "@mui/icons-material/Celebration";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { throttle } from "lodash";
import SearchIcon from "@mui/icons-material/Search";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import ClubListCard from "../../components/club/ClubListCard.js";

const Clubs = () => {
  let [category, setCategory] = useState("");
  //검색 스위치
  const [searchRegion, setSearchRegion] = useState("");

  const getClubList = async () => {
    if (!category) {
      const response = await fetch(`http://localhost:4000/clubs?searchRegion=${searchRegion}`);
      const data = await response.json();
      console.log(`data`);
      console.log(data);
      console.log(`data`);
      if (!data || data.length < 6) {
        window.removeEventListener("scroll", handleScroll);
      }
      return data;
    } else if (category) {
      const response = await fetch(`http://localhost:4000/clubs/${category}?searchRegion=${searchRegion}`);
      const data = await response.json();
      if (!data || data.length < 6) {
        window.removeEventListener("scroll", handleScroll);
      }
      return data;
    }
  };
  const {
    data: clubList = [], // 기본값을 빈 배열로 설정
    error,
    isLoading,
    isError,
    isFetching, // isFetching 사용
  } = useQuery({
    queryKey: ["clubList", category, searchRegion],
    queryFn: getClubList,
    keepPreviousData: true,
  });
  //카테고리 바뀔 떄 마다 리스트를 불러옴 -> 어차피 3개씩 불러와서 빨리빨리 부르는데 헉 생각해보니...
  const navigate = useNavigate();

  //무한스크롤 구현
  const getClubListScroll = async (newScrollCount) => {
    let response;
    if (!category) {
      response = await fetch(`http://localhost:4000/clubs/scroll/${newScrollCount}?searchRegion=${searchRegion}`);
    } else {
      response = await fetch(`http://localhost:4000/clubs/scroll/${newScrollCount}/${category}?searchRegion=${searchRegion}`);
    }
    const data = await response.json();
    setScrollData((prevData) => [...prevData, ...data]); // Merge previous and new data

    if (data.length === 6) {
      window.addEventListener("scroll", handleScroll);
    } else {
      window.removeEventListener("scroll", handleScroll);
    }
  };
  let [scrollCount, setScrollCount] = useState(1);
  let [scrollData, setScrollData] = useState([]);

  let handleScroll = useCallback(
    throttle(() => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      let scrollHeight = document.documentElement.scrollHeight;
      let clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setScrollCount((prevCount) => {
          const newCount = prevCount + 1;

          getClubListScroll(newCount);
          return newCount;
        });
        window.removeEventListener("scroll", handleScroll);
      }
    }, 500),
    [category, scrollCount, searchRegion],
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // 클린 업 펑션
    };
  }, [category, searchRegion]);
  //무한스크롤 구현.end

  const handleRegionClick = () => {
    setScrollData([]);
    setScrollCount(1);
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = ""; // 주소 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져옴
        if (data.userSelectedType === "R") {
          addr = data.roadAddress; // 도로명 주소
        } else {
          addr = data.jibunAddress; // 지번 주소
        }
        setSearchRegion(addr.split(" ")[1]);
      },
    }).open();
  };

  const handleCategoryClick2 = (item) => {
    setScrollData([]);
    setScrollCount(1);
    setCategory(item.text);
  };

  //지도스크립트 useEffect
  useEffect(() => {
    // Daum Postcode API 스크립트 로드
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // 컴포넌트 언마운트 시 스크립트 정리
    };
  }, []);

  if (isLoading && !isFetching) {
    return <div>로딩 중...</div>; // 최초 로딩 시
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Box sx={{ width: "100%", backgroundColor: "#F2F2F2", position: "relative" }}>
      <Box sx={{ width: "100%", height: "450px", backgroundColor: "white" }}>{/* 이 부분에 데이터 출력 */}</Box>
      <Container maxWidth="lg" sx={{ marginTop: "40px", paddingBottom: "40px" }}>
        <Typography mb={3} variant="h5">
          지역기반 추천
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <ClubListCard clubList={clubList} />

          {scrollData &&
            scrollData.map((club) => (
              <Grid item xs={12} sm={6} md={4} key={club._id} sx={{}}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "white",
                    boxShadow: "none", // 그림자 제거
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "300px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    <img
                      src={`http://localhost:4000/` + club.img}
                      alt={club.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "20px 20px 0 0",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "#f2f2f2",
                        width: "150px",
                        height: "40px",
                        paddingBottom: "18px",
                        borderBottom: "15px solid #f2f2f2",
                        borderLeft: "15px solid #f2f2f2",
                        borderBottomLeftRadius: "20px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          marginTop: "5px",
                          marginLeft: "5px",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "130px",
                          height: "50px",
                          color: "#A6836F",
                          fontWeight: "bold",
                          borderRadius: "20px",
                          backgroundColor: "white",
                        }}
                      >
                        {club.mainCategory}
                      </Box>
                    </Box>
                    {/* 지옥의 둥굴게 말기.... */}
                    <ModeNightIcon
                      sx={{
                        position: "absolute",
                        top: 49,
                        right: -24,
                        color: "#f2f2f2",
                        zIndex: 3,
                        fontSize: "50px",
                        transform: "rotate(-45deg)",
                      }}
                    />
                    <ModeNightIcon
                      sx={{
                        position: "absolute",
                        top: -23,
                        right: 141,
                        color: "#f2f2f2",
                        zIndex: 3,
                        fontSize: "50px",
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      height: "200px",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "700",
                        fontSize: "20px",
                        color: "#383535",
                        marginBottom: "8px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {club.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "500",
                        fontSize: "18px",
                        color: "#777777",
                        marginBottom: "8px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {club.subTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#9F9E9D",
                        marginBottom: "8px",
                      }}
                    >
                      {club.region.district}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CommentRoundedIcon sx={{ color: "#BF5B16", fontSize: "18px" }} />
                      <Typography variant="body2" sx={{ color: "#BF5B16", marginLeft: "5px" }}>
                        5분 전 대화
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "auto",
                        borderTop: "1px solid #e0e0e0",
                        paddingTop: "8px",
                        paddingBottom: "8px",
                      }}
                    >
                      <AvatarGroup max={4}>
                        {club.members.map((member, idx) => (
                          <Avatar key={idx} alt={`Member ${idx + 1}`} src={member.img} sx={{ width: 32, height: 32 }} />
                        ))}
                      </AvatarGroup>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "8px",
                          fontSize: "16px",
                          color: "#666666",
                        }}
                      >
                        <PeopleRoundedIcon sx={{ fontSize: "18px" }} />
                        <span style={{ marginLeft: "5px" }}>
                          {club.members.length}/{club.maxMember}
                        </span>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -5,
                        right: 0,
                        backgroundColor: "#f2f2f2",
                        width: "65px",
                        height: "60px",
                        paddingTop: "10px",
                        borderBottom: "15px solid #f2f2f2",
                        borderLeft: "15px solid #f2f2f2",
                        borderTopLeftRadius: "20px",
                      }}
                      onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          marginTop: "5px",
                          marginRight: "5px",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "50px",
                          height: "50px",
                          color: "white",
                          fontWeight: "bold",
                          borderRadius: "25px",
                          backgroundColor: "#A6836F",
                          transition: "all 0.3s ease", // 모든 속성에 대해 부드럽게 변환
                          "&:hover": {
                            transform: "scale(1.2)", // 호버 시 크기 확대
                            color: "#f2f2f2", // 색상 변경
                            backgroundColor: "#3f51b5", // 배경색 변경
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // 그림자 추가
                            cursor: "pointer",
                          },
                        }}
                      >
                        <ArrowForwardIcon sx={{ color: "white" }} />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -0,
                        right: 80,
                        backgroundColor: "white",
                        width: "20px",
                        height: "20px",
                        zIndex: 3,
                        borderBottomRightRadius: "50px", // 둥근 모서리 적용
                      }}
                    ></Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -0,
                        right: 80,
                        backgroundColor: "#f2f2f2",
                        width: "20px",
                        height: "20px",
                        zIndex: 2,
                      }}
                    ></Box>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 78,
                        right: 0,
                        backgroundColor: "white",
                        width: "20px",
                        height: "20px",
                        zIndex: 3,
                        borderBottomRightRadius: "50px", // 둥근 모서리 적용
                      }}
                    ></Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 78,
                        right: 0,
                        backgroundColor: "#f2f2f2",
                        width: "20px",
                        height: "20px",
                        zIndex: 2,
                      }}
                    ></Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Clubs;
