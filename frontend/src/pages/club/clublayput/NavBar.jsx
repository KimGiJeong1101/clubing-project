import React, { useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { makeEnterChat } from "../../../store/actions/chatActions";
import { useDispatch, useSelector } from "react-redux";

function NavBar() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");
  const [showNavbar, setShowNavbar] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selected, setSelected] = useState("홈");

  const userId = useSelector((state) => state.user?.userData?.user?._id);

  const handleClickChat = async () => {
    // 채팅방을 구성하려면 최소한의 유저와 해당 모임의 번호나 제목이 필요해서 최초에 userId, clubNumber 여부로 에러를 체크한다
    try {
      // userId가 없다면 콘솔에 에러 메시지 출력 후 종료
      if (!userId) {
        console.error("User ID is missing.");
        return; // 유저 ID가 없으면 채팅방 생성하지 않음
      }

      // clubNumber가 없다면 에러를 던짐
      if (!clubNumber) {
        throw new Error("클럽 번호가 없습니다."); // 필수 정보 체크
      }

      // 실제 참여자 ID 리스트 (밑에 선언되어 있는 makeEnterChat 함수를 정상적으로 실행하기 위해 필요한 파라미터 값을 선언해서 세팅해준다)
      // 그리고 참여자는 여러명이고, 스키마에 배열로 되어 있어서 const participants = [userId]; 이렇게 선언해줬다
      const participants = [userId];
      console.log("Participants array before sending:", participants);

      // 채팅방 생성
      const actionResult = await dispatch(makeEnterChat({ clubId: clubNumber, participants })); // 이제 여기서 함수가 실행된다.
      console.log("Action result:", actionResult);

      // 서버로부터 받은 응답 처리
      const chattingRoom = actionResult.payload; // 위의 함수가 성공적으로 실행이 되었다면 서버에서 받은 데이터가 있을텐데 payload안에 담긴다

      // 채팅방 정보가 없다면 에러를 던짐
      // 이건 말 그대로 채팅방이 없거나 에러가 나면 에러를 던짐
      if (!chattingRoom) {
        throw new Error("채팅방 정보를 불러오는 데 실패했습니다.");
      }

      // 채팅방으로 이동 (chattingRoom._id는 필요 없으므로 clubNumber만 사용)
      console.log("Chat room data:", chattingRoom);

      navigate(`/clubs/chat?clubNumber=${clubNumber}`); // 위에 모든 로직이 이루어진뒤에 해당 URL로 이동
    } catch (error) {
      // 에러 메시지 출력
      console.error("Error entering chat room:", error.message || error);
    }
  };

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
    { name: "채팅", onClick: handleClickChat },
  ];

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          // position: "fixed",
          // top: "85px", // Header의 높이만큼 떨어뜨림
          // left: 0,
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
              fontSize: "18px",
            }}
          >
            {navItems.map((item) => (
              <Grid
                item
                xs={3}
                mt={2.5}
                key={item.name}
                component={Link} // 기본 Link 컴포넌트 사용
                to={item.path}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault(); // 기본 링크 동작 방지
                    item.onClick(); // onClick 핸들러 호출
                  }
                }}
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
                    bottom: 10,
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
