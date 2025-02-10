import React, { useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

function NavBar() {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");


  const [selected, setSelected] = useState("홈");

  // 현재 URL을 기준으로 선택된 항목을 결정
  const getSelected = () => {
    const path = location.pathname;
    if (path.includes("board")) return "게시판";
    if (path.includes("gallery")) return "사진첩";
    if (path.includes("chat")) return "채팅";
    return "홈"; // 기본값
  };

  // 선택된 항목을 현재 URL과 비교하여 상태를 설정
  React.useEffect(() => {
    setSelected(getSelected());
  }, [location.pathname]);

  
  const navItems = [
    { name: "홈", path: `/clubs/main?clubNumber=${clubNumber}` },
    { name: "게시판", path: `/clubs/board?clubNumber=${clubNumber}` },
    { name: "사진첩", path: `/clubs/gallery?clubNumber=${clubNumber}` },
    { name: "채팅", path: `/clubs/chat?clubNumber=${clubNumber}`}, 
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
        }}
      >
        <Container maxWidth="md" sx={{ padding: "0px !important" }}>
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
                xs={3}
                key={item.name}
                component={Link} // Link 컴포넌트를 사용하여 네비게이션 처리
                to={item.path}
                sx={{
                  height: "50px",
                  position: "relative",
                  textDecoration: "none", // 기본 링크 스타일 제거
                  cursor: "pointer",
                  color: selected === item.name ? "black" : "rgba(0, 0, 0, 0.3)",
                  "&:hover": {
                    color: "gray",
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
