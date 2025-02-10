import React from "react";
import { Box, Container, Grid, Typography, Tooltip, IconButton } from "@mui/material";
import ClubListCard from "../../components/club/ClubListCard.js";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const fetchClubs = async ({ pageParam = 1, email }) => {
  const response = await axios.get(`http://localhost:4000/clubs/recommend/scroll/${pageParam}`, {
    params: { email },
  });
  return response.data;
};

const ClubsList = () => {
  const email = useSelector((state) => state.user?.userData?.user?.email || null);

  const {
    data: clubList = [],
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["clubList", email],
    queryFn: ({ pageParam = 1 }) => fetchClubs({ pageParam, email }),
    getNextPageParam: (lastPage, allPages) => (lastPage.length ? allPages.length + 1 : undefined),
    keepPreviousData: true,
  });

  // 무한 스크롤 구현
  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, loadMore]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const tooltipText = email
    ? `선택한 지역 및 관심사 기준으로 추천해드립니다.  
       지역 및 관심사 변경은
       마이페이지-회원정보-정보수정 에서 가능합니다.`
    : `선택한 지역 및 관심사 기준으로 추천해드립니다. 로그인 시 정확한 추천 정보를 받을 수 있습니다.`;

  return (
    <Box sx={{ width: "100%", paddingTop: "20px", backgroundColor: "#F2F2F2", position: "relative" }}>
      <Container maxWidth="lg" sx={{ paddingBottom: "40px" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Typography variant="h5">지역기반 추천</Typography>
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

        <Grid container spacing={2} sx={{ display: "flex" }}>
          <ClubListCard clubList={clubList.pages.flat()} />
        </Grid>

        {/* 로딩 인디케이터 (옵션) */}
        {isLoading && <div>더 로딩 중...</div>}
      </Container>
    </Box>
  );
};

export default ClubsList;
