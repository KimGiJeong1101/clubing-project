import React, { useEffect, useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const [selected, setSelected] = useState("추천모임");
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  // 현재 URL을 기준으로 선택된 항목을 결정
  const getSelected = () => {
    const path = location.pathname;
    if (path.includes("home")) return "발견";
    if (path.includes("meetingList")) return "정모일정";
    if (path.includes("newClubList")) return "신규모임";
    if (path.includes("class")) return "클래스";
    if (path.includes("event")) return "이벤트";
    return "추천모임"; // 기본값
  };

  // 선택된 항목을 현재 URL과 비교하여 상태를 설정
  useEffect(() => {
    setSelected(getSelected());
  }, [location.pathname]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowNavbar(window.scrollY < 100 || window.scrollY < scrollY); // 100px 이상 스크롤 시 숨김
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollY]);

  const navItems = [
    { name: "발견", path: `/home` },
    { name: "추천모임", path: `/clubList` },
    { name: "정모일정", path: `/meetingList` },
    { name: "신규모임", path: `/newClubList` },
    { name: "클래스", path: `/class` },
    { name: "이벤트", path: `/event` }
  ];

  return (
    <Box sx={{ width: "100%", height: "114px" }}>
      <Box
        sx={{
          position: "fixed",
          top: "64px", // Header의 높이만큼 떨어뜨림
          left: 0,
          width: "100%",
          height: "50px",
          backgroundColor: "white",
          color: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100, // Header와 동일한 z-index로 설정
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <Container maxWidth="lg" sx={{ padding: "0px !important" }}>
          <Grid
            container
            sx={{
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "21px",
            }}
          >
            {navItems.map((item) => (
              <Grid
                item
                xs={2}
                key={item.name}
                component={Link} // Link 컴포넌트를 사용하여 네비게이션 처리
                to={item.path}
                sx={{
                  height: "50px",
                  position: "relative",
                  textDecoration: "none", // 기본 링크 스타일 제거
                  cursor: "pointer",
                  color: selected === item.name ? "black" : "rgba(0, 0, 0, 0.6)",
                  "&:hover": {
                    color: "rgba(0, 0, 0, 1)",
                    cursor: "pointer",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    width: selected === item.name ? "70%" : "0%",
                    height: "2px",
                    backgroundColor: "#595959",
                    transform: "translateX(-50%)",
                    transition: "width 0.3s ease",
                  },
                }}
              >
                {item.name}
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default NavBar;
