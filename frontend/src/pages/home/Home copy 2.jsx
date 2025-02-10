import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, Container } from "@mui/material";
import { motion } from "framer-motion";
import "./HomeImageCarousel.css";
import HomeCard from "../../components/commonEffect/HomeCard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

const fetchRecommendedClubs = async (email) => {
  const response = await axios.get(`http://localhost:4000/home/recommend`, {
    params: { email },
  });
  return response.data;
};

const Home = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  // 클럽 데이터
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
    queryKey: ["recommendedClubs", "aa@aa.aa"], // 예시 이메일 (필요 시 동적으로 변경)
    queryFn: () => fetchRecommendedClubs("user@example.com"),
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

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setRotation((prev) => prev + 20);
    }, 3000);

    return () => clearInterval(rotateInterval);
  }, []);

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
            <Typography variant="body1" sx={{ color: "gray" }}>
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
              perspective: "10000px", // 3D 원근 효과
              overflow: "hidden", // 화면 밖으로 넘치는 카드 숨김
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "200px",
                height: "200px",
                transformStyle: "preserve-3d", // 3D 효과 유지
                transform: `rotateY(${rotation}deg)`, // 회전 각도
                transition: "transform 10s ease", // 회전 애니메이션
              }}
            >
              {newClubsData &&
                newClubsData.map((club, idx) => {
                  const angle = (idx / newClubsData.length) * 360; // 각 카드마다 각도 계산

                  return (
                    <Box
                      key={idx}
                      sx={{
                        position: "absolute",
                        width: "100px",
                        height: "75px",
                        transform: `rotateY(${angle}deg) rotateX(0deg) translateZ(400px)`, // Y축 회전 후 각 카드의 위치와 축을 조정
                        backfaceVisibility: "hidden", // 카드 뒷면 숨김
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
            <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
              추천 모임
            </Typography>
            <Typography variant="body1" sx={{ color: "gray" }}>
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
            <Typography variant="body1" sx={{ color: "gray" }}>
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
            <Typography variant="body1" sx={{ color: "gray" }}>
              더보기
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
