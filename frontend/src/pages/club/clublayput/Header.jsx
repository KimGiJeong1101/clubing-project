import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { Container, Popover } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useDispatch, useSelector } from "react-redux";
import { fetchGetClub } from "../../../store/reducers/clubReducer";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axios";

function Header() {
  const location = useLocation();
  const dispatch = useDispatch();
  const getClub = useSelector((state) => state.getClub);
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.userData.user);
  // URL에서 ID 추출
  //Clubmember=3 이란 거 가져오기 위해서!

  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  useEffect(() => {
    if (clubNumber) {
      dispatch(fetchGetClub(clubNumber));
    }
  }, [dispatch, clubNumber]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`http://localhost:4000/clubs/delete/${clubNumber}`);
      // 삭제 후 원하는 페이지로 이동
      navigate("/clublist");
      alert("삭제 완료");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
    handleClose();
  };
  //하트 아이콘 색깔 state
  const [isFavorite, setIsFavorite] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const cancellClub = () => {
    if (user.email === "") {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    } else {
      axiosInstance
        .post(`http://localhost:4000/clubs/cencellMember/${clubNumber}`)
        .then((response) => {
          alert("모임 탈퇴 성공");
          navigate(`/mypage`);
        })
        .catch((err) => {
          console.log(err);
          alert("모임 탈퇴에 실패했습니다.");
        });
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  //hyk 추가 언디파인에 대한 에러 값을 설정
  const clubs = getClub.clubs || {};
  const adminEmail = clubs.admin || "";
  const members = Array.isArray(clubs.members) ? clubs.members : [];

  return (
    <Box
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
      <Container maxWidth="lg" sx={{ padding: "0px !important" }}>
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
                navigate("/clublist");
              }}
            ></ArrowBackIosIcon>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "black" }}>
              {getClub.clubs.title}
            </Typography>
            <FavoriteIcon
              onClick={() => {
                setIsFavorite(!isFavorite);
              }}
              sx={{
                padding: "7px",
                color: isFavorite ? "lightcoral" : "gray",
                ":hover": {
                  cursor: "pointer",
                },
              }}
            />
            <ShareOutlinedIcon sx={{ padding: "7px", color: "black" }} />
            <MenuIcon aria-describedby={id} variant="contained" onClick={handleClick} sx={{ padding: "7px", color: "black" }} />
          </Toolbar>
        </Box>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          {/* hyk 수정 위에 언디파인 예외처리를 위해 레퍼런스 값 변경 */}
          {user.email === adminEmail && (
            <Box onClick={handleDelete} sx={{ padding: "10px" }}>
              클럽 삭제하기
            </Box>
          )}

          {user.email !== getClub.clubs.admin && getClub?.clubs?.members?.includes(user.email) && (
            <Box
              onClick={() => {
                cancellClub();
              }}
              sx={{ padding: "10px" }}
            >
              클럽 탈퇴하기
            </Box>
          )}
          <Box onClick={() => {}} sx={{ padding: "10px" }}>
            모임 url 공유하기
          </Box>
          <Box onClick={() => {}} sx={{ padding: "10px" }}>
            모임 신고하기
          </Box>
        </Popover>
      </Container>
    </Box>
  );
}

export default Header;
