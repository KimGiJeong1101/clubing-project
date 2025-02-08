import React ,{  useState , useEffect } from "react";
// import Toolbar from "@mui/material/Toolbar";
// import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Container, Tooltip , Box, Grid,Typography,Toolbar  } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {  Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../src/store/actions/userActions'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // 마이페이지 아이콘 추가
import LogoutIcon from '@mui/icons-material/Logout';// 로그아웃 아이콘
import LoginIcon from '@mui/icons-material/Login';// 로그인 아이콘
import GroupAdd from '@mui/icons-material/GroupAdd';
import MessageIcon from '@mui/icons-material/Message'; //채팅 아이콘
import NotificationsIcon from '@mui/icons-material/Notifications'; //알람 아이콘
import SearchIcon from '@mui/icons-material/Search'; //검색 아이콘

function Header() {

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
    // { name: "발견", path: `/home` },  //이거 생략 어떠신지
    { name: "추천모임", path: `/clubList` },
    { name: "정모일정", path: `/meetingList` },
    { name: "신규모임", path: `/newClubList` },
    { name: "클래스", path: `/class` },
    { name: "이벤트", path: `/event` }
  ];


  //스크롤에 따라 보이고 안보이고 
  const homeLocation = useSelector(state => {
    // state.user가 undefined인 경우를 체크하고, 그 외의 경우에 접근합니다.
    const user = state.user?.userData?.user;
    return user?.homeLocation?.neighborhood || ' ';
  });

  const routes = [
    { to: '/login', name: '로그인', auth: false },
    { to: '/register', name: '회원가입', auth: false },
  
    { to: '', name: '로그아웃', auth: true },
    { to: '/mypage', name: '마이페이지', auth: true },
  ];
  

    const isAuth = useSelector(state => state.user?.isAuth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      try {
        dispatch(logoutUser())
        .then(() => {
          navigate('/login');
        })
        
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <Box>

    {/* <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "70px",
        backgroundColor: "white",
        color: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100, // Material-UI의 기본 z-index보다 높은 값 설정
      }}
    >
      <Container maxWidth="xl" sx={{ padding: "0px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src="/logo/khaki_long.png" alt="Logo" style={{ height: '30px' }} />
          <Box>
          <Toolbar sx={{ padding: "0px !important" }}>
            <ArrowBackIosIcon
              sx={{
                color: "black",
                marginRight: "5px",
                "&:hover": {
                  color: "gray",
                  cursor: "pointer",
                },
              }}
              onClick={() => {
              }}
            ></ArrowBackIosIcon>
            <Typography
              variant="h6"
              component="div"
              sx={{color: "black" }}
            >
              {homeLocation && homeLocation !== ' ' ? (
                <p>{homeLocation}</p>
              ) : (
                <p>로그인 정보가 없습니다.</p>
              )}
            </Typography>
            {routes.map(({ to, name, auth }) => {
              return isAuth === auth ? (
                <Tooltip title={name} key={name} arrow>
                <IconButton
                  key={name}
                  variant="contained"  // or 'outlined' or 'text'
                  sx={{
                    ...(name === '로그인' && {
                      '&:hover': {
                        color: 'white',
                      },
                    }),
                    ...(name === '로그아웃' && {
                      '&:hover': {
                        color: 'white',
                      },
                    }),
                      ...(name === '마이페이지' && {
                    }),
                  }}
                  onClick={() => {
                    if (name === '로그아웃') {
                      handleLogout(); // 로그아웃 핸들러 호출
                    } else {
                      navigate(to);
                      //로그아웃이 아닐경우 to 경로로 이동
                    }
                  }}
                >
                {name === '마이페이지' ? (
                  <AccountCircleIcon
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '로그아웃' ? (
                  <LogoutIcon 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '로그인' ? (
                  <LoginIcon 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '회원가입' ? (
                  <GroupAdd 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>    
                ) : (
                  name
                )}
                </IconButton>
                </Tooltip>
              ) : null;
            })}
            <Tooltip title="즐겨찾기" arrow>
            <FavoriteIcon
              onClick={() => {
              }}
              sx={{ padding: "7px", color: "gray",":hover":{
                cursor:'pointer'
              }, fontSize: 32 }}
            />
             </Tooltip>
             <Tooltip title="공유" arrow>
            <ShareOutlinedIcon 
              onClick={() => {
              }}
            sx={{ padding: "7px", color: "black", fontSize: 32 }} />
            </Tooltip>
            <Tooltip title="메뉴" arrow>
            <MenuIcon sx={{ padding: "7px", color: "black", fontSize: 32 }} />
            </Tooltip>
          </Toolbar>
        </Box>

        </Box>

        
      </Container>
    </Box>
    <Box sx={{  position: "fixed", top: "70px", width: "100%",height:'30px'}}>
      <Typography>여백이지렁</Typography>
    </Box> */}

    <Box sx={{ width: "100%", height: "85px" }}>
      <Box
        sx={{
          position: "fixed",
          top: 10, // Header의 높이만큼 떨어뜨림
          left: 0,
          width: "100%",
          height: "75px",
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
        <Container maxWidth="xl" sx={{ padding: "0px !important" }}>
          <Grid
            container
            sx={{
              alignItems: "center",
              justifyContent: "center",
              justifyContent: "space-between", // 요소 간의 간격을 유지
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            <Box ml={8} mr={3}>
              <Link to="/home">
                <img src="/logo/khaki_long.png" alt="Logo" style={{ height: '45px' }} />
              </Link>
            </Box>

            {navItems.map((item) => (
              <Grid
                item
                xs={1}
                mr={3}
                key={item.name}
                component={Link} // Link 컴포넌트를 사용하여 네비게이션 처리
                to={item.path}
                sx={{
                  height: "35px",
                  top: "3px",
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
          <Toolbar sx={{ padding: "0px !important" }}>
            
            {/* <ArrowBackIosIcon
              sx={{
                color: "black",
                marginRight: "5px",
                "&:hover": {
                  color: "gray",
                  cursor: "pointer",
                },
              }}
              onClick={() => {
              }}
            ></ArrowBackIosIcon> */}
            
            <Box
              sx={{
                border: "1px solid gray", // 선의 두께와 색상
                borderRadius: "8px", // 모서리 둥글게
                padding: "4px 8px", // 상자 안의 여백
                display: "inline-block", // 상자의 크기만큼만 차지하도록
                backgroundColor: "transparent", // 상자 속을 투명하게
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ color: "gray", fontWeight: 600 }}
              >
                {homeLocation && homeLocation !== ' ' ? (
                  homeLocation
                ) : (
                  "로그인 정보가 없습니다."
                )}
              </Typography>
            </Box>

            <Tooltip title="검색" arrow>
              <SearchIcon
                onClick={() => {
                }}
               sx={{ padding: "7px", color: "gray",":hover":{
                cursor:'pointer'
              }, fontSize: 24 }} />
            </Tooltip>

            <Tooltip title="알림" arrow>
              <NotificationsIcon
                onClick={() => {
                }}
                sx={{ padding: "7px", color: "gray",":hover":{
                  cursor:'pointer'
                }, fontSize: 24 }} />
            </Tooltip>

            <Tooltip title="채팅" arrow>
              <MessageIcon
                onClick={() => {
                }}
                sx={{ padding: "7px", color: "gray",":hover":{
                  cursor:'pointer'
                }, fontSize: 24 }} />
            </Tooltip>

            {routes.map(({ to, name, auth }) => {
              return isAuth === auth ? (
                <Tooltip title={name} key={name} arrow>
                <IconButton
                  key={name}
                  variant="contained"  // or 'outlined' or 'text'
                  sx={{
                    ...(name === '로그인' && {
                      '&:hover': {
                        color: 'white',
                      },
                    }),
                    ...(name === '로그아웃' && {
                      '&:hover': {
                        color: 'white',
                      },
                    }),
                      ...(name === '마이페이지' && {
                    }),
                  }}
                  onClick={() => {
                    if (name === '로그아웃') {
                      handleLogout(); // 로그아웃 핸들러 호출
                    } else {
                      navigate(to);
                      //로그아웃이 아닐경우 to 경로로 이동
                    }
                  }}
                >
                {name === '마이페이지' ? (
                  <AccountCircleIcon
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '로그아웃' ? (
                  <LogoutIcon 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '로그인' ? (
                  <LoginIcon 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>
                ) : name === '회원가입' ? (
                  <GroupAdd 
                  sx={{ 
                    color: "gray",
                    ":hover":{
                    cursor:'pointer',
                    fontSize: 24
                    } }}/>    
                ) : (
                  name
                )}
                </IconButton>
                </Tooltip>
              ) : null;
            })}


            {/* <Tooltip title="즐겨찾기" arrow>
            <FavoriteIcon
              onClick={() => {
              }}
              sx={{ padding: "7px", color: "gray",":hover":{
                cursor:'pointer'
              }, fontSize: 32 }}
            />
             </Tooltip>
             <Tooltip title="공유" arrow>
            <ShareOutlinedIcon 
              onClick={() => {
              }}
            sx={{ padding: "7px", color: "black", fontSize: 32 }} />
            </Tooltip>
            <Tooltip title="메뉴" arrow>
            <MenuIcon sx={{ padding: "7px", color: "black", fontSize: 32 }} />
            </Tooltip> */}

          </Toolbar>

          </Grid>
        </Container>
      </Box>
    </Box>
    </Box>
  );
}

export default Header;
