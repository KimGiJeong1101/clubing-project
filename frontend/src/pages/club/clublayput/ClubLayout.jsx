import React, { useEffect, useState } from "react";
import MainHeader from "../../../layout/Header";
import MainFooter from "../../../layout/Footer";
import Header from "./Header";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Container, Grid } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axiosInstance from "../../../utils/axios";
import { fetchGetClub } from "../../../store/reducers/clubReducer";
import { sendMessage } from "../../../store/actions/myMessageActions";
import { useDispatch, useSelector } from "react-redux";
import WishHearts from "../../../components/club/WishHearts.jsx";
function ClubLayout() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getClub = useSelector((state) => state.getClub);
  const user = useSelector((state) => state.user.userData.user);

  const [joinHandler, setJoinHandler] = useState(false);

  useEffect(() => {
    if (clubNumber) {
      dispatch(fetchGetClub(clubNumber));
    }
  }, [dispatch, clubNumber]);

  useEffect(() => {
    if (getClub.clubs && user.email) {
      setJoinHandler(!getClub.clubs.members.includes(user.email));
    }
  }, [getClub, user.email, clubNumber]);
  const handleOpen = () => {
    if (user.email === "") {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    } else {
      axiosInstance
        .post(`http://localhost:4000/clubs/addMember/${clubNumber}`)
        .then((response) => {
          alert("모임 가입성공");

          // 모임 가입 성공 후 메시지 DB에 저장
          const messages = [
            {
              club: clubNumber,
              recipient: user.email,
              sender: getClub.clubs.title, // 클럽 이름
              content: `${getClub.clubs.title} 모임 가입을 축하드립니다.`,
              title: "모임 가입성공",
            },
            {
              club: clubNumber,
              recipient: getClub.clubs.admin,
              sender: user.email, // 클럽 이름
              content: `${user.email}에서 모임에 가입했습니다.`,
              title: `${user.email}님 모임에 가입`,
            }

            // 필요에 따라 추가 메시지 객체를 배열에 추가
          ];
          // 메시지 전송을 위한 액션 디스패치
          dispatch(sendMessage(messages[0]));
          // 클럽 주인에게 메시지 전송 (axios 사용)
          axiosInstance
            .post("/users/messages", messages[1])
            // 모든 디스패치가 완료될 때까지 기다립니다.
            .then(() => {
              console.log("메시지 전송 성공");
              navigate(`/mypage`);
            })
            .catch((err) => {
              console.error("메시지 전송 실패", err);
            });
        })
        .catch((err) => {
          console.log(err);
          alert("모임 가입에 실패했습니다.");
        });
    }
  };

  return (
    <Box>
      <MainHeader />
      {/* <Header />  */}

      <NavBar />
      <main>
        <Outlet />
        {/* "#F0F0F0" */}

        {joinHandler && (
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1200,
            }}
          >
            <Container maxWidth="sm">
              <Grid container>
                <Grid
                  item
                  xs={1}
                  sx={{
                    backgroundColor: "#F0EDED",
                    textAlign: "center",
                    borderRadius: "20px 0px 0px 20px",
                  }}
                >
                  <WishHearts />
                </Grid>
                <Grid item xs={11} sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleOpen}
                    sx={{
                      width: "100%",
                      fontSize: "18px",
                      borderRadius: "0px 20px 20px 0px",
                    }}
                  >
                    모임 가입하기
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>
        )}
      </main>
      {/* <Footer /> */}
      <MainFooter />
    </Box>
  );
}
export default ClubLayout;
