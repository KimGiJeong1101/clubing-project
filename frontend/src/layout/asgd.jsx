//윤기 오빠 코드 

import React ,{  useState , useEffect } from "react";
// import Toolbar from "@mui/material/Toolbar";
// import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Container, Tooltip , Box, Grid,Typography,Toolbar, Menu, MenuItem, Dialog,DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from '@mui/icons-material/Close';
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../src/store/actions/userActions'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // 마이페이지 아이콘 추가
import LogoutIcon from '@mui/icons-material/Logout';// 로그아웃 아이콘
import LoginIcon from '@mui/icons-material/Login';// 로그인 아이콘
import GroupAdd from '@mui/icons-material/GroupAdd';
import MessageIcon from '@mui/icons-material/Message'; //채팅 아이콘
import NotificationsIcon from '@mui/icons-material/Notifications'; //알람 아이콘
import SearchIcon from '@mui/icons-material/Search'; //검색 아이콘
import Badge from '@mui/material/Badge';// 알림 뱃지
import { fetchMessages } from "../store/actions/myMessageActions";

function Header( ) {

  const location = useLocation();
  const [selected, setSelected] = useState("추천모임");
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const isAuth = useSelector(state => state.user?.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const user = useSelector((state) => state.user?.userData?.user || {});
  const myMessage = useSelector((state) => state.myMessage?.messages || {});
  const [unreadCount, setUnreadCount] = useState(0);
  const [path, setPath] = useState(location.pathname);
  //console.log('안 읽음만 들어가나?',myMessage)
  //console.log('메시지 카운트',unreadCount)
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
    const count = myMessage.filter(message => !message.isRead).length;
  setUnreadCount(count);
  }, [myMessage]); // myMessage가 변경될 때마다 실행

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
    // { name: "클래스", path: `/class` }, // 이거 생략
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

    const handleLogout = () => {
      try {
        dispatch(logoutUser())
        .then(() => {
          navigate('/login');
        })
        handleClose(); // 메뉴 닫기
      } catch (error) {
        console.error(error);
      }
    };

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    //검색 부분
    const [showSearch, setShowSearch] = useState(false);
    const [openSearchDialog, setOpenSearchDialog] = useState(false);
    const handleSearchDialogOpen = () => {
      setOpenSearchDialog(true);
    };
    const handleSearchDialogClose = () => {
      setOpenSearchDialog(false);
    };
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (event) => {
      setSearchTerm(event.target.value);
    };

    const handleMymessage = () => {
      navigate('/mypage/mymessage'); // 클릭 시 이동할 경로
    };

  return (
    <Box sx={{ width: "100%", height: "85px" }}>
    <Box
      sx={{
        position: "fixed",
        top: 0, // Header의 높이만큼 떨어뜨림
        left: 0,
        width: "100%",
        height: "85px",
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
            justifyContent: "space-between", // 요소 간의 간격을 유지
            textAlign: "center",
            fontSize: "20px",
          }}
        >
          <Box>
            <Link to="/">
              <img src="/logo/khaki_long_h.png" alt="Logo" style={{ height: '50px' }} />
            </Link>
          </Box>
  
          <Box
            mr ={40}
            sx={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px', // 항목 사이의 간격 설정
              padding: '10px', // 상하 여백 설정
              backgroundColor: 'white', // 배경색 설정
              borderBottom: '1px ' // 상단 경계 설정
            }}
          >
            {navItems.map((item) => (
              <Box
                key={item.name}
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  color: selected === item.name ? 'black' : 'rgba(0, 0, 0, 0.6)',
                  textDecoration: 'none',
                  fontFamily: 'KCC-Hanbit',
                  '&:hover': {
                    color: 'black',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '0%',
                    height: '2px',
                    backgroundColor: 'black',
                    transform: 'translateX(-50%)',
                    transition: 'width 0.3s ease',
                  },
                  '&:hover::after': {
                    width: '100%',
                  }
                }}
              >
                <Link
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit', // 부모에서 설정한 색상 상속
                  }}
                  onClick={() => setSelected(item.name)} // 클릭 시 선택된 항목 변경
                >
                  {item.name}
                </Link>
              </Box>
            ))}
          </Box>

  
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Toolbar sx={{ padding: "0px !important", minWidth: "0" }}>
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
                  sx={{ color: "gray", fontFamily: 'KCC-Hanbit', fontWeight: 600 }}
                >
                  {homeLocation && homeLocation !== ' ' ? (
                    homeLocation
                  ) : (
                    "미로그인"
                  )}
                </Typography>
              </Box>
  
              <Tooltip title="검색" arrow>
                <SearchIcon
                  onClick={handleSearchDialogOpen}
                  sx={{ padding: "7px", color: "gray", ":hover": { cursor: 'pointer' }, fontSize: 24 }}
                />
              </Tooltip>

  
              <Tooltip title="알림" arrow>
                <Badge
                  badgeContent={unreadCount > 0 ? unreadCount : null} // unreadCount가 0보다 클 때만 표시
                  color="error"
                  sx={{
                    '& .MuiBadge-dot': {
                      backgroundColor: 'red',
                      width: 20, // 배지의 가로 크기
                      height: 20, // 배지의 세로 크기
                      top: 5, // 배지의 위쪽 위치 조정
                      right: 5, // 배지의 오른쪽 위치 조정
                      borderRadius: '50%', // 배지를 원형으로 만듭니다
                    },
                    '.MuiBadge-root': {
                      '& .MuiBadge-dot': {
                        top: 0, // 배지의 상단 위치 조정
                        right: 0, // 배지의 우측 위치 조정
                      },
                    },
                  }}
                >
                  <NotificationsIcon
                     onClick={handleMymessage}
                    sx={{ padding: "7px", color: "gray", ":hover": { cursor: 'pointer' }, fontSize: 24 }}
                  />
                </Badge>
              </Tooltip>
  
              <Tooltip title="채팅" arrow>
                <MessageIcon
                  onClick={() => {}}
                  sx={{ padding: "7px", color: "gray", ":hover": { cursor: 'pointer' }, fontSize: 24 }}
                />
              </Tooltip>
{/*   
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
            })} */}

            <Tooltip title="계정" arrow>
                <IconButton onClick={handleClick}>
                  <AccountCircleIcon sx={{ color: "gray", ":hover": { cursor: 'pointer', fontSize: 24 } }} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    maxHeight: 48 * 4.5,
                    width: '20ch',
                  },
                }}
              >
                {routes.map(({ to, name, auth }) => (
                  isAuth === auth ? (
                    <MenuItem
                      key={name}
                      onClick={() => {
                        if (name === '로그아웃') {
                          handleLogout(); // 로그아웃 핸들러 호출
                        } else {
                          navigate(to);
                        }
                        handleClose();
                      }}
                    >
                      {name === '로그아웃' ? <LogoutIcon sx={{ marginRight: 1 }} /> :
                       name === '로그인' ? <LoginIcon sx={{ marginRight: 1 }} /> :
                       name === '회원가입' ? <GroupAdd sx={{ marginRight: 1 }} /> :
                       name === '마이페이지' ? <AccountCircleIcon sx={{ marginRight: 1 }} /> : name}
                      {name}
                    </MenuItem>
                  ) : null
                ))}
              </Menu>

            </Toolbar>
          </Box>
        </Grid>
      </Container>
    </Box>

    <Dialog
      open={openSearchDialog}
      onClose={handleSearchDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        모임 이름 검색
        <IconButton onClick={handleSearchDialogClose} sx={{ padding: 0 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            backgroundColor: 'white',
          }}
        >
          <SearchIcon sx={{ color: 'gray', fontSize: 24, marginRight: 1 }} />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={handleInputChange}
            style={{ 
              border: 'none',
              outline: 'none',
              padding: '4px',
              fontSize: '20px',
              flexGrow: 1,
              borderBottom: '2px solid gray' // 두꺼운 밑줄 추가
            }}
          />
        </Box>
        {/* 검색 결과 리스트 */}
        {searchTerm && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">검색 결과</Typography>
            {/* 검색 결과를 여기에 표시 */}
          </Box>
        )}
      </DialogContent>
    </Dialog>




  </Box>
  
  );
}

export default Header;