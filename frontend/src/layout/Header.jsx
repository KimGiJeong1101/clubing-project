import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Typography, Toolbar, IconButton, Tooltip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, Button, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import GroupAdd from "@mui/icons-material/GroupAdd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../src/store/actions/userActions";
import { useMediaQuery, useTheme } from "@mui/material";
import Badge from "@mui/material/Badge"; // 알림 뱃지
import { fetchMessages } from "../store/actions/myMessageActions";
import axios from "axios";

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // 'sm'보다 작을 때 모바일로 간주  //md로 일단 바꿔놓음(시간되면 md 전에 안 움직이기게 수정)
  const location = useLocation();
  const [selected, setSelected] = useState("모임찾기");
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuth = useSelector((state) => state.user?.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user?.userData?.user || {});
  const myMessage = useSelector((state) => state.myMessage?.messages || {});
  const [unreadCount, setUnreadCount] = useState(0);
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    setPath(location.pathname); // URL 경로를 상태로 저장
  }, [location.pathname]); // 경로가 변경될 때마다 실행

  useEffect(() => {
    if (user.email) {
      dispatch(fetchMessages(user.email)); // 리덕스 액션으로 메시지 가져오기
    }
  }, [user.email, path, dispatch]); // 이메일 또는 path가 변경될 때마다 실행

  useEffect(() => {
    if (!myMessage) {
      setUnreadCount(0);
      return;
    }
    // unreadCount 계산
    const count = myMessage.filter((message) => !message.isRead).length;
    setUnreadCount(count);
  }, [myMessage]); // myMessage가 변경될 때마다 실행

  const routes = [
    { to: "/login", name: "로그인", auth: false },
    { to: "/register", name: "회원가입", auth: false },
    { to: "", name: "로그아웃", auth: true },
    { to: "/mypage", name: "마이페이지", auth: true },
  ];

  const navItems = [
    { name: "모임찾기", path: "/clubList" },
    { name: "정모일정", path: "/meetingList" },
    { name: "추천모임", path: "/recommendedClubList" },
    { name: "이벤트", path: "/event" },
  ];

  const getSelected = () => {
    const path = location.pathname;
    if (path.includes("home")) return "발견";
    if (path.includes("clubList")) return "모임찾기";
    if (path.includes("meetingList")) return "정모일정";
    if (path.includes("recommendedClubList")) return "추천모임";
    if (path.includes("event")) return "이벤트";
    return "발견";
  };

  useEffect(() => {
    setSelected(getSelected());
  }, [location.pathname]);

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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      dispatch(logoutUser()).then(() => {
        navigate("/login");
      });
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const [showSearch, setShowSearch] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태 추가

  const handleSearchDialogOpen = () => {
    setOpenSearchDialog(true);
  };

  const handleSearchDialogClose = () => {
    setOpenSearchDialog(false);
    setSearchTerm(""); // 다이얼로그 닫을 때 검색어 초기화
    setSearchResults([]); // 결과도 초기화
  };

  const handleInputChange = async (event) => {
    const term = event.target.value;
    console.log("입력된 검색어:", term);
    setSearchTerm(term);
    if (term) {
      try {
        const response = await axios.get(`http://localhost:4000/clubs/search/test?title=${term}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("검색 요청 실패", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleMymessage = () => {
    navigate("/mypage/mymessage"); // 클릭 시 이동할 경로
  };

  return (
    <Box sx={{ width: "100%", height: "85px" }}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "85px",
          backgroundColor: "white",
          color: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <Container maxWidth="lg" sx={{ padding: "0px !important" }}>
          <Grid container sx={{ alignItems: "center", justifyContent: "space-between", textAlign: "center", fontSize: "20px" }}>
            <Box>
              <Link to="/">
                <img src="/logo/khaki_long_h.png" alt="Logo" style={{ height: "50px" }} />
              </Link>
            </Box>
            <Box
              mr={40}
              sx={{
                display: { xs: "none", md: "flex" },
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                backgroundColor: "white",
              }}
            >
              {navItems.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    position: "relative",
                    textAlign: "center",
                    cursor: "pointer",
                    padding: "5px 10px",
                    color: selected === item.name ? "black" : "rgba(0, 0, 0, 0.6)",
                    textDecoration: "none",
                    fontFamily: "KCC-Hanbit",
                    "&:hover": {
                      color: "black",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      width: "0%",
                      height: "2px",
                      backgroundColor: "black",
                      transform: "translateX(-50%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  <Link
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                    onClick={() => setSelected(item.name)}
                  >
                    {item.name}
                  </Link>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Toolbar sx={{ padding: "0px !important", minWidth: "0" }}>
                <Tooltip title="검색" arrow>
                  <SearchIcon onClick={handleSearchDialogOpen} sx={{ padding: "7px", color: "gray", ":hover": { cursor: "pointer" }, fontSize: 24 }} />
                </Tooltip>

                <Tooltip title="알림" arrow>
                  <Badge
                    badgeContent={unreadCount > 0 ? unreadCount : null} // unreadCount가 0보다 클 때만 표시
                    color="error"
                    sx={{
                      "& .MuiBadge-dot": {
                        backgroundColor: "red",
                        width: 20, // 배지의 가로 크기
                        height: 20, // 배지의 세로 크기
                        top: 5, // 배지의 위쪽 위치 조정
                        right: 5, // 배지의 오른쪽 위치 조정
                        borderRadius: "50%", // 배지를 원형으로 만듭니다
                      },
                      ".MuiBadge-root": {
                        "& .MuiBadge-dot": {
                          top: 0, // 배지의 상단 위치 조정
                          right: 0, // 배지의 우측 위치 조정
                        },
                      },
                    }}
                  >
                    <NotificationsIcon onClick={handleMymessage} sx={{ padding: "7px", color: "gray", ":hover": { cursor: "pointer" }, fontSize: 24 }} />
                  </Badge>
                </Tooltip>

                <Tooltip title="채팅" arrow>
                  <MessageIcon onClick={() => {}} sx={{ padding: "7px", color: "gray", ":hover": { cursor: "pointer" }, fontSize: 24 }} />
                </Tooltip>

                {/* 화면이 큰 경우에만 계정 아이콘을 표시 */}
                {!isMobile && (
                  <Tooltip title="계정" arrow>
                    <IconButton onClick={handleClick}>
                      <AccountCircleIcon sx={{ color: "gray", ":hover": { cursor: "pointer", fontSize: 24 } }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      maxHeight: 48 * 4.5,
                      width: "20ch",
                    },
                  }}
                >
                  {routes.map(({ to, name, auth }) =>
                    isAuth === auth ? (
                      <MenuItem
                        key={name}
                        onClick={() => {
                          if (name === "로그아웃") {
                            handleLogout();
                          } else {
                            navigate(to);
                          }
                          handleClose();
                        }}
                      >
                        {name === "로그아웃" ? <LogoutIcon sx={{ marginRight: 1 }} /> : name === "로그인" ? <LoginIcon sx={{ marginRight: 1 }} /> : name === "회원가입" ? <GroupAdd sx={{ marginRight: 1 }} /> : name === "마이페이지" ? <AccountCircleIcon sx={{ marginRight: 1 }} /> : name}
                        {name}
                      </MenuItem>
                    ) : null,
                  )}
                </Menu>
              </Toolbar>
              {/* 햄버거 아이콘 */}
              {isMobile && (
                <IconButton sx={{ display: { xs: "flex", md: "none" }, color: "gray" }} onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Drawer 컴포넌트 */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{
            width: 250,
            height: "100%",
            padding: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <IconButton onClick={handleDrawerToggle} sx={{ alignSelf: "flex-end" }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, mt: 2 }}>
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} style={{ textDecoration: "none", color: "inherit" }} onClick={() => setSelected(item.name)}>
                <Typography
                  sx={{
                    padding: "10px 0",
                    color: selected === item.name ? "black" : "rgba(0, 0, 0, 0.6)",
                    "&:hover": { color: "black" },
                  }}
                >
                  {item.name}
                </Typography>
              </Link>
            ))}
          </Box>
          <Box>
            {routes.map(({ to, name, auth }) =>
              isAuth === auth ? (
                <Button
                  key={name}
                  onClick={() => {
                    if (name === "로그아웃") {
                      handleLogout();
                    } else {
                      navigate(to);
                    }
                    handleDrawerToggle();
                  }}
                  sx={{ display: "flex", alignItems: "center", my: 1, color: "#A6836F" }}
                >
                  {name === "로그아웃" ? <LogoutIcon sx={{ marginRight: 1 }} /> : name === "로그인" ? <LoginIcon sx={{ marginRight: 1 }} /> : name === "회원가입" ? <GroupAdd sx={{ marginRight: 1 }} /> : name === "마이페이지" ? <AccountCircleIcon sx={{ marginRight: 1 }} /> : name}
                  {name}
                </Button>
              ) : null,
            )}
          </Box>
        </Box>
      </Drawer>

      {/* 검색 다이얼로그 */}
      <Dialog open={openSearchDialog} onClose={handleSearchDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          모임 이름 검색
          <IconButton onClick={handleSearchDialogClose} sx={{ padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              backgroundColor: "white",
            }}
          >
            <SearchIcon sx={{ color: "gray", fontSize: 24, marginRight: 1 }} />
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={handleInputChange}
              style={{
                border: "none",
                outline: "none",
                padding: "4px",
                fontSize: "20px",
                flexGrow: 1,
                borderBottom: "2px solid gray",
              }}
            />
          </Box>
          {/* 검색 결과 리스트 */}
          {searchResults.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6">검색 결과</Typography>
              {searchResults.map((club) => (
                <Box key={club._id} sx={{ padding: "10px 0", borderBottom: "1px solid gray" }}>
                  <Link
                    to={`/clubs/main?clubNumber=${club._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={handleSearchDialogClose} // 클릭 시 모달 닫기
                  >
                    <Typography>{club.title}</Typography> {/* 모임 제목 */}
                  </Link>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Header;
