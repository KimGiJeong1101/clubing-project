import React, { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import ClubListCard from "../../components/club/ClubListCard.js";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const ClubsList = () => {
  const [category, setCategory] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const email = useSelector((state) => state.user?.userData?.user?.email || null);
  const user = useSelector((state) => state.user?.userData?.user?.email || null);

  // 데이터 요청 함수
  const fetchClubs = async ({ pageParam = 1 }) => {
    let response;
    if (!category) {
      response = await fetch(`http://localhost:4000/clubs/recommend/scroll/${pageParam}?searchRegion=${searchRegion}`);
    } else {
      response = await fetch(`http://localhost:4000/clubs/recommend/scroll/${pageParam}/${category}?searchRegion=${searchRegion}`);
    }
    const data = await response.json();
    return data;
  };

  // Infinite Query 사용
  const {
    data: clubListData,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["clubList", category, searchRegion],
    queryFn: fetchClubs,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length >= 3 ? allPages.length + 1 : undefined;
    },
    keepPreviousData: true,
  });

  const clubsList = clubListData?.pages.flat() || [];

  // 더보기 버튼 클릭 핸들러
  const loadMoreClubs = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRegionClick = () => {
    setPage(1);
    setHasMore(true);
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = "";
        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }
        setSearchRegion(addr.split(" ")[1]);
      },
    }).open();
  };

  const handleCategoryClick2 = (item) => {
    setPage(1);
    setHasMore(true);
    setCategory(item.text);
  };

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

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Box sx={{ width: "100%", paddingTop: "20px", backgroundColor: "#F2F2F2", position: "relative" }}>
      <Container maxWidth="lg" sx={{ paddingBottom: "40px" }}>
        <Box>
          <Typography mb={4} variant="h5">
            지역기반 추천
          </Typography>
        </Box>
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
          {clubsList.map((club) => (
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
                  boxShadow: "none",
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
                    src={`http://localhost:4000/${club.img}`}
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
                    <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                      <PeopleRoundedIcon sx={{ color: "#BF5B16", fontSize: "18px" }} />
                      <Typography variant="body2" sx={{ color: "#BF5B16", marginLeft: "5px" }}>
                        {club.members.length}명
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {hasNextPage && (
          <Button onClick={loadMoreClubs} variant="contained" color="primary" sx={{ marginTop: "20px" }}>
            더보기
          </Button>
        )}
      </Container>
    </Box>
  );
};

export default ClubsList;
