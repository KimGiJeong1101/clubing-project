import React ,{ useEffect } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Container, Tooltip } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../src/store/actions/userActions'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // 마이페이지 아이콘 추가
import LogoutIcon from '@mui/icons-material/Logout';// 로그아웃 아이콘
import LoginIcon from '@mui/icons-material/Login';// 로그인 아이콘
import GroupAdd from '@mui/icons-material/GroupAdd';

function Header() {

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
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "64px",
        backgroundColor: "white",
        color: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100, // Material-UI의 기본 z-index보다 높은 값 설정
      }}
    >
      <Container maxWidth="lg" sx={{ padding: "0px !important" }}>
        <Box>
          <Toolbar sx={{ padding: "0px !important" }}>
            <Box>
            <img src="/logo/khaki_long.png" alt="Logo" style={{ height: '30px' }} />
            </Box>
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
              sx={{ flexGrow: 1, color: "black" }}
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
      </Container>
    </Box>
  );
}

export default Header;
