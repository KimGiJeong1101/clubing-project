import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, Container, Tooltip, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import "./HomeImageCarousel.css";
import HomeCard from "../../components/commonEffect/HomeCard";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const images = ["/MainImage/mainImage.webp", "/MainImage/mainImage2.webp", "/MainImage/mainImage3.webp"];

const imageVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? window.innerWidth : -window.innerWidth,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  }),
  center: {
    zIndex: 1,
    opacity: 1,
    x: 0,
    transition: {
      x: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        restDelta: 2,
        restSpeed: 2,
      },
      opacity: { duration: 3 },
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    opacity: 0,
    x: direction < 0 ? window.innerWidth : -window.innerWidth,
    transition: {
      x: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
      opacity: { duration: 3 },
    },
  }),
};

// API 부분
const fetchCardData = async () => {
  const response = await axios.get(`http://localhost:4000/clubs/home/card`);
  return response.data;
};

const fetchNewClubsData = async () => {
  const response = await axios.get(`http://localhost:4000/clubs/home/card/new`);
  return response.data;
};

// 추천 모임 데이터 가져오기
const fetchRecommendedClubs = async (email) => {
  const response = await axios.get("http://localhost:4000/clubs/home/recommend", {
    params: { email }, // 여기서 email은 문자열입니다.
  });
  return response.data;
};

const Home = () => {
  const navigate = useNavigate();

  const [[page, direction], setPage] = useState([0, 0]);

  const email = useSelector((state) => state.user?.userData?.user?.email || null);
  // console.log(email)

  // 기존 클럽 데이터
  const {
    isLoading: loadingClubs,
    error: clubsError,
    data: clubsData,
  } = useQuery({
    queryKey: ["clubData"],
    queryFn: fetchCardData,
  });

  // 신규 모임 데이터
  const {
    isLoading: loadingNewClubs,
    error: newClubsError,
    data: newClubsData,
  } = useQuery({
    queryKey: ["newClubData"],
    queryFn: fetchNewClubsData,
  });

  // 추천 모임 데이터
  const {
    isLoading: loadingRecommendedClubs,
    error: recommendedClubsError,
    data: recommendedClubsData,
  } = useQuery({
    queryKey: ["recommendedClubs", email], // 이메일을 쿼리 키에 포함
    queryFn: () => fetchRecommendedClubs(email), // 이메일을 직접 전달
    enabled: true, // 항상 쿼리를 실행
  });

  const isLoading = loadingClubs || loadingNewClubs || loadingRecommendedClubs;
  const error = clubsError || newClubsError || recommendedClubsError;

  const nextImage = () => {
    setPage(([prevPage]) => [prevPage + 1, 1]);
  };

  const prevImage = () => {
    setPage(([prevPage]) => [prevPage - 1, -1]);
  };

  const imageIndex = (page) => ((page % images.length) + images.length) % images.length;

  useEffect(() => {
    const interval = setInterval(nextImage, 8000);
    return () => clearInterval(interval);
  }, []);

  // 중심을 기준으로 카드들이 회전하도록 하는 로직
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setRotation((prev) => prev + 20); // 매번 20도씩 회전
    }, 3000);

    return () => clearInterval(rotateInterval);
  }, []);

  const tooltipText = email
    ? `선택한 지역 및 관심사 기준으로 추천해드립니다.  
       지역 및 관심사 변경은
       마이페이지-회원정보-정보수정 에서 가능합니다.`
    : `선택한 지역 및 관심사 기준으로 추천해드립니다. 로그인 시 정확한 추천 정보를 받을 수 있습니다.`;

  return (
    <Box sx={{ width: "100%", backgroundColor: "#F2F2F2", position: "relative" }}>
      <Container maxWidth="lg" sx={{ paddingBottom: "40px" }}>
        {/* 이미지 캐러셀 */}
        <Box className="carousel-container" sx={{ position: "relative" }}>
          <Box sx={{ display: "flex" }}>
            <Button className="prev-btn" onClick={prevImage} sx={{ color: "black" }}>
              &#10094;
            </Button>
            <Box className="carousel">
              <motion.div className="image-frame">
                <motion.img key={page} src={images[imageIndex(page)]} custom={direction} variants={imageVariants} initial="enter" animate="center" exit="exit" className="carousel-image" />
              </motion.div>
            </Box>
            <Button className="next-btn" onClick={nextImage} sx={{ color: "black" }}>
              &#10095;
            </Button>
          </Box>
        </Box>

        {isLoading && <div>Loading...</div>}
        {error && <div>Error fetching data</div>}

        {/* 모임 찾기 렌더링되는 카드 섹션 */}
        <Box sx={{ mt: 5, padding: "20px" }}>
          <Box sx={{ borderBottom: "3px solid black", mb: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
              모임 찾기
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "gray",
                cursor: "pointer", // 기본 커서 스타일
                "&:hover": {
                  color: "black", // 호버 시 색상도 변경하고 싶다면 추가
                  cursor: "pointer", // 호버 시 커서 모양 변경
                },
              }}
              onClick={() => navigate(`/clubList`)}
            >
              더보기
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {clubsData &&
              clubsData.map((club, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <HomeCard club={club} />
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* 신규 모임 렌더링되는 카드 섹션 */}
        <Box sx={{ mt: 5, padding: "20px" }}>
          <Box sx={{ borderBottom: "3px solid black", mb: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
              신규 모임
            </Typography>
          </Box>

          {/* 카드들을 중앙을 기준으로 회전시키는 컨테이너 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "230px",
              perspective: "10000px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "200px",
                height: "200px",
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotation}deg)`,
                transition: "transform 10s ease",
              }}
            >
              {newClubsData &&
                newClubsData.map((club, idx) => {
                  const angle = (idx / newClubsData.length) * 360; // 각도 계산

                  return (
                    <Box
                      key={idx}
                      sx={{
                        position: "absolute",
                        width: "120px", // 카드 크기 조정
                        height: "90px",
                        transform: `rotateY(${angle}deg) translateZ(250px)`, // Z축 이동값 증가
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <HomeCard club={club} />
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </Box>

        {/* 추천 모임 렌더링되는 카드 섹션 */}
        <Box sx={{ mt: 5, padding: "20px" }}>
          <Box sx={{ borderBottom: "3px solid black", mb: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
                추천 모임
              </Typography>
              <Tooltip
                title={tooltipText}
                arrow
                sx={{
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // 흐린 회색 배경
                    color: "white",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                  },
                }}
              >
                <IconButton sx={{ color: "gray", fontSize: "1.5rem" }}>
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "gray",
                cursor: "pointer", // 기본 커서 스타일
                "&:hover": {
                  color: "black", // 호버 시 색상도 변경하고 싶다면 추가
                  cursor: "pointer", // 호버 시 커서 모양 변경
                },
              }}
              onClick={() => navigate(`/recommendedClubList`)}
            >
              더보기
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {recommendedClubsData &&
              recommendedClubsData.map((club, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <HomeCard club={club} />
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* 정모일정 */}
        <Box sx={{ mt: 5, padding: "20px" }}>
          <Box sx={{ borderBottom: "3px solid black", mb: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
              정모일정
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "gray",
                cursor: "pointer", // 기본 커서 스타일
                "&:hover": {
                  color: "black", // 호버 시 색상도 변경하고 싶다면 추가
                  cursor: "pointer", // 호버 시 커서 모양 변경
                },
              }}
              onClick={() => navigate(`/meetingList`)}
            >
              더보기
            </Typography>
          </Box>
        </Box>

        {/* 이벤트 */}
        <Box sx={{ mt: 5, padding: "20px" }}>
          <Box sx={{ borderBottom: "3px solid black", mb: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
              이벤트
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "gray",
                cursor: "pointer", // 기본 커서 스타일
                "&:hover": {
                  color: "black", // 호버 시 색상도 변경하고 싶다면 추가
                  cursor: "pointer", // 호버 시 커서 모양 변경
                },
              }}
              onClick={() => navigate(`/event`)}
            >
              더보기
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
