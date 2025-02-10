import React, { useCallback, useEffect, useState } from "react";
import { Box, Container, Grid, Snackbar, SnackbarContent, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BubbleAnimation from "../../components/club/BubbleAnimation.js";
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
import { styled } from "@mui/system";

const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
  backgroundColor: "white", // 배경을 하얀색으로 설정
  color: "#A6836F", // 텍스트 색상 설정
  borderRadius: "4px", // 테두리 둥글게 설정 (선택사항)
}));
const Clubs = () => {
  let [category, setCategory] = useState("");
  //검색 스위치
  const [searchRegion, setSearchRegion] = useState("");

  //////스낵바
  const location = useLocation();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  useEffect(() => {
    if (location.state && location.state.snackbarMessage) {
      setSnackbarMessage(location.state.snackbarMessage);
      setOpenSnackbar(true);
    }
  }, [location]);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  /////스낵바 .end

  const getClubList = async () => {
    if (!category) {
      const response = await fetch(`http://localhost:4000/clubs?searchRegion=${searchRegion}`);
      const data = await response.json();
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
      console.log(`data`);
      console.log(data);
      console.log(`data`);
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
      <Fab
        onClick={() => {
          navigate("/clubs/create");
        }}
        aria-label="add"
        style={{
          backgroundColor: "#A6836F",
          color: "white",
          position: "fixed",
          bottom: "50px",
          right: "50px",
        }}
      >
        <AddIcon />
      </Fab>
      <Box
        sx={{
          position: "fixed",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      ></Box>
      <Box sx={{ width: "100%", height: "450px", backgroundColor: "white" }}>
        <Container maxWidth="lg" sx={{ paddingBottom: "40px" }}>
          <Grid container spacing={3} justifyContent="center">
            {[
              // { color: "#68BDAB", icon: <StorefrontIcon sx={{ width: "70px", height: "70px" }} />, text: "전부보기" },
              { color: "#71ABF0", icon: <FastfoodIcon sx={{ width: "70px", height: "70px" }} />, text: "푸드·드링크" },
              { color: "#DC6A5A", icon: <MenuBookIcon sx={{ width: "70px", height: "70px" }} />, text: "자기계발" },
              { color: "#9363D1", icon: <NightlifeIcon sx={{ width: "70px", height: "70px" }} />, text: "취미" },
              { color: "#D7E56E", icon: <RowingIcon sx={{ width: "70px", height: "70px" }} />, text: "액티비티" },
              { color: "#EE7E8C", icon: <CelebrationIcon sx={{ width: "70px", height: "70px" }} />, text: "파티" },
              { color: "#4C5686", icon: <SportsKabaddiIcon sx={{ width: "70px", height: "70px" }} />, text: "소셜게임" },
              { color: "#F7D16E", icon: <ColorLensIcon sx={{ width: "70px", height: "70px" }} />, text: "문화·예술" },
              { color: "#C25BA1", icon: <LocalAtmIcon sx={{ width: "70px", height: "70px" }} />, text: "N잡·재테크" },
              { color: "#DEB650", icon: <LoyaltyIcon sx={{ width: "70px", height: "70px" }} />, text: "연애·사랑" },
              { color: "#78C17C", icon: <LocalAirportIcon sx={{ width: "70px", height: "70px" }} />, text: "여행·나들이" },
              { color: "#828ED6", icon: <Diversity1Icon sx={{ width: "70px", height: "70px" }} />, text: "동네·또래" },
              { color: "#8E44AD", icon: <AutoStoriesIcon sx={{ width: "70px", height: "70px" }} />, text: "외국어" },
            ].map((item, index) => (
              <Grid item xs={2} sm={2} lg={2} key={index}>
                <Box
                  onClick={() => {
                    handleCategoryClick2(item);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      backgroundColor: item.color,
                      width: "100px",
                      height: "100px",
                      borderRadius: "50px",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "8px",
                      transition: "background-color 0.3s",
                      "&:hover": {
                        backgroundColor: item.color + "BF", // Slightly darker color on hover
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ textAlign: "center", fontSize: "18px", fontWeight: "550" }}>{item.text}</Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography
            variant={"h6"}
            onClick={handleRegionClick}
            sx={{
              width: "80%",
              backgroundColor: "#f2f2f2",
              padding: "12px 20px",
              borderRadius: "20px",
              color: "#A6836F",
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
              position: "relative", // 부모 요소가 위치를 기준으로 버튼을 배치
              marginTop: "50px",
              marginLeft: "20px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease", // 부드러운 트랜지션 추가
              "&:hover": {
                transform: "scale(1.02)", // 호버 시 크기 확대
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", // 부드러운 그림자 추가
                cursor: "pointer",
              },
            }}
          >
            <b>지역으로 클럽 찾기</b> <span style={{ fontSize: "15px", marginLeft: "10px" }}>* 카테고리와 지역을 동시에 선택하여 더 정확한 검색 결과를 확인해보세요.</span>
            <Box
              sx={{
                width: "10%",
                backgroundColor: "#A6836F",
                padding: "12px 20px",
                height: "33px",
                borderTopRightRadius: "20px",
                borderBottomRightRadius: "20px",
                color: "white",
                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                position: "absolute", // 부모 요소가 위치를 기준으로 버튼을 배치
                right: 0,
                top: 0,
                textAlign: "center",
              }}
            >
              <SearchIcon sx={{ fontSize: "35px" }} />
            </Box>
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ marginTop: "40px", paddingBottom: "40px" }}>
        <Grid container spacing={2} sx={{ display: "flex" }}>
          {searchRegion && (
            <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <Typography
                variant={"h6"}
                style={{
                  backgroundColor: "#fff",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  color: "#A6836F",
                  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                  position: "relative", // 부모 요소가 위치를 기준으로 버튼을 배치
                  opacity: "0.8",
                }}
              >
                <b>"{searchRegion}"</b>로 검색한 결과
                <Box
                  onClick={() => setSearchRegion("")}
                  style={{
                    position: "absolute", // 절대 위치 설정
                    top: "-10px", // Typography 오른쪽 위에 배치
                    right: "-10px",
                    width: "30px ",
                    height: "30px ",
                    backgroundColor: "#A6836F",
                    borderRadius: "15px", // 완전한 원 모양으로 설정
                    color: "#ffffff",
                    fontSize: "12px", // 작은 글씨 크기
                    opacity: "0.9",
                    transition: "opacity 0.3s ease",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // 버튼에 작은 그림자 추가
                    zIndex: "1",
                    margin: "0",
                    padding: "0",
                    textAlign: "center",
                    alignItems: "center",
                  }}
                  onMouseOver={(e) => (e.target.style.cursor = "pointer")}
                >
                  <DeleteForeverIcon sx={{ paddingTop: "2px" }} />
                </Box>
              </Typography>
            </div>
          )}
          {category && (
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "10px", marginLeft: "20px" }}>
              <Typography
                variant={"h6"}
                style={{
                  backgroundColor: "#fff",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  color: "#A6836F",
                  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                  position: "relative", // 부모 요소가 위치를 기준으로 버튼을 배치
                  opacity: "0.8",
                }}
              >
                {category}
                <Box
                  onClick={() => setCategory("")}
                  style={{
                    position: "absolute", // 절대 위치 설정
                    top: "-10px", // Typography 오른쪽 위에 배치
                    right: "-10px",
                    width: "30px ",
                    height: "30px ",
                    backgroundColor: "#A6836F",
                    borderRadius: "15px", // 완전한 원 모양으로 설정
                    color: "#ffffff",
                    fontSize: "12px", // 작은 글씨 크기
                    opacity: "0.9",
                    transition: "opacity 0.3s ease",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // 버튼에 작은 그림자 추가
                    zIndex: "1",
                    margin: "0",
                    padding: "0",
                    textAlign: "center",
                    alignItems: "center",
                  }}
                  onMouseOver={(e) => (e.target.style.cursor = "pointer")}
                >
                  <DeleteForeverIcon sx={{ paddingTop: "2px" }} />
                </Box>
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <ClubListCard clubList={clubList} />
          {scrollData && <ClubListCard clubList={scrollData} />}
          {/* 스낵바 */}
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <StyledSnackbarContent message={snackbarMessage} />
          </Snackbar>
          {/* 스낵바.end */}
        </Grid>
      </Container>
      {/* <BubbleAnimation />  */}
      {/* BubbleAnimation을 상위 요소로 추가 */}
    </Box>
  );
};

export default Clubs;
