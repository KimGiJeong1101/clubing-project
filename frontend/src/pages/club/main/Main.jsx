import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarGroup, Box, Container, Fab, Grid, Menu, MenuItem, Paper, Popover, Snackbar, SnackbarContent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WhereToVoteIcon from "@mui/icons-material/WhereToVote";
import PeopleIcon from "@mui/icons-material/People";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국어 로케일 import
import axiosInstance from "./../../../utils/axios";
import { fetchCategoryClubList } from "../../../store/reducers/clubReducer.js";
import CustomButton from "../../../components/club/CustomButton.jsx";
import CustomButton2 from "../../../components/club/CustomButton2.jsx";
import MeetingCreate1 from "../meeting/MeetingCreate1.jsx";
import MeetingCreate2 from "../meeting/MeetingCreate2.jsx";
import ClubCarousel from "../../../components/club/ClubCarousel.jsx";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from "@mui/icons-material/Menu";
import MemberModal from "./MemberModal.jsx";
import WishHearts from "../../../components/club/WishHearts.jsx";
import { sendMessage } from "../../../store/actions/myMessageActions";
import { saveVisitClub } from "../../../store/actions/RecentVisitAction";
import { styled } from "@mui/system";
const Main = (wishHeart) => {
  //Clubmember=3 이란 거 가져오기 위해서!
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");
  //Clubmember=3 이란 거 가져오기 위해서!.end

  ////////////////스낵바
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar 메시지 관리

  const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
    backgroundColor: "white", // 배경색 설정
    color: "#A6836F", // 텍스트 색상 설정
    borderRadius: "20px",
    width: "250px",
    height: "50px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 1, // 초기 투명도
    transition: "opacity 0.5s ease-in-out", // 애니메이션 효과
  }));

  const handleSnackbarClick = () => {
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  // const action = (
  //   <>
  //     <IconButton size="small" aria-label="close" sx={{ backgroundColor: "#565903", color: "white" }} onClick={handleSnackbarClose}>
  //       <CloseIcon fontSize="small" />
  //     </IconButton>
  //   </>
  // );
  useEffect(() => {
    console.log("location:", location); // location 객체 확인
    if (location.state && location.state.snackbarMessage) {
      console.log("여기 와??");
      setSnackbarMessage(location.state.snackbarMessage);
      setOpenSnackbar(true);
    }
  }, [location]);
  ////////////////스낵바.end

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberModalOpen2, setMemberModalOpen2] = useState(false);
  //리덕스 함수 부르기 위해서
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //멤버들 숨겼다가 나왔다가
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  //헤더에 있던 거 옮기기 .
  //헤더에 있던 거 옮기기 .
  //헤더에 있던 거 옮기기 .
  const getClub = useSelector((state) => state.getClub);
  const [anchorHeaderEl, setAnchorHeaderEl] = useState(null);
  const handleClick2 = (event) => {
    setAnchorHeaderEl(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorHeaderEl(null);
  };
  const cancellClub = () => {
    if (user.userData.user.email === "") {
      handleSnackbarClick();
    } else {
      axiosInstance
        .post(`http://localhost:4000/clubs/cencellMember/${clubNumber}`)
        .then((response) => {
          // 모임 가입 성공 후 메시지 DB에 저장
          const messages = [
            {
              club: clubNumber,
              recipient: user.userData.user.email,
              sender: getClub.clubs.title, // 클럽 이름
              content: `${getClub.clubs.title}에서 탈퇴하셨습니다.`,
              title: "모임 탈퇴 성공",
            },
            {
              club: clubNumber,
              recipient: getClub.clubs.admin,
              sender: user.userData.user.email, // 클럽 이름
              content: `${user.userData.user.email}님이 모임에서 탈퇴하셨습니다.`,
              title: "탈퇴",
            },
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
          navigate(`/clubList`, { state: { snackbarMessage: "모임 탈퇴가 완료되었습니다." } });
        })
        .catch((err) => {
          console.log(err);
          setSnackbarMessage("모임 탈퇴가 실패되었습니다.");
          handleSnackbarClick();
        });
    }
  };
  const open2 = Boolean(anchorHeaderEl);
  const id = open2 ? "simple-popover" : undefined;
  //hyk 추가 언디파인에 대한 에러 값을 설정
  const clubs = getClub.clubs || {};
  const adminEmail = clubs?.admin || "";
  //헤더에 있던 거 옮기기 .end
  //헤더에 있던 거 옮기기 .end
  //헤더에 있던 거 옮기기 .end

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [clubNumber]);

  //정기모임 글 등록, 두번쨰 모달
  const [category, setCategory] = useState("");
  const [secondModal, setSecondModal] = useState(false);
  const secondModalClose = () => {
    setSecondModal(false);
  };
  //정기모임 글 등록, 두번쨰 모달 .end

  //모달창관련 스위치 및 State
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const FadHandleClick = (picCategory) => {
    setCategory(picCategory);
    setOpen(false);
    setSecondModal(true);
  };
  //모달창관련.end

  //카테고리로 같이 연관된 모임 추천해주려고
  const getCategoryClubList = useSelector((state) => state.categoryClub);
  const [clubList, setClubList] = useState([]);
  useEffect(() => {
    let copy = [];
    for (let i = 0; i < getCategoryClubList.clubs.length; i++) {
      if (getCategoryClubList.clubs[i]._id.toString() !== queryParams.get("clubNumber")) {
        copy.push(getCategoryClubList.clubs[i]);
      }
    }
    setClubList(copy);
  }, [getCategoryClubList]);
  //카테고리로 같이 연관된 모임 추천해주려고.end

  //로그인 정보 where redux
  const user = useSelector((state) => state.user);
  const email = user.userData.user.email; // 하트에 쓰려고

  const [meetingList, setMeetingList] = useState([]);
  const [meeetingListBoolean, setMeeetingListBoolean] = useState([]);

  //로그인 정보 where redux.end

  //미팅 지우기
  const deleteMeeting = async (meetingNumber) => {
    await fetch(`http://localhost:4000/meetings/delete/` + meetingNumber);
    setSnackbarMessage("정기모임이 삭제되었습니다.");
    handleSnackbarClick();
  };
  //미팅 지우기.end

  //클럽read할 때 내용들 불러오기 -> react-Query로!
  const getReadClub = async () => {
    const response = await fetch(`http://localhost:4000/clubs/read2/${clubNumber}`);
    const data = await response.json();

    await dispatch(fetchCategoryClubList(data.mainCategory));
    return data;
  };
  //클럽read할 때 내용들 불러오기 -> react-Query로!.end
  const {
    data: readClub,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["readClub", clubNumber, memberModalOpen, memberModalOpen2, secondModal],
    queryFn: getReadClub,
    enabled: !!clubNumber, //
  });

  //메인에서의 모임수정 및 모임삭제관련 모달
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  //메인에서의 모임수정 및 모임삭제관련 모달.end

  //모임수정 시 이동 핸들러
  const handleUpdate = () => {
    navigate(`/clubs/main/update?clubNumber=${clubNumber}`);
    handleClose();
  };
  //모임수정 시 이동 핸들러.end

  //모임삭제 시 이동 핸들러
  const handleDelete2 = async () => {
    try {
      await axiosInstance.delete(`http://localhost:4000/clubs/delete/${clubNumber}`);
      // 삭제 후 원하는 페이지로 이동
      navigate(`/clubList`, { state: { snackbarMessage: "모임 삭제가 완료되었습니다." } });
    } catch (error) {
      console.error("삭제 실패:", error);
    }
    handleClose();
  };
  //모임삭제 시 이동 핸들러.end

  //정모 참석하기 버튼 눌렀을 때 , 콜백함수
  const meetingJoin = (meetingId) => {
    if (!user.userData.user.email) {
      setSnackbarMessage("로그인 정보가 없습니다.");
      handleSnackbarClick();
      // navigate("/login");
    } else {
      axiosInstance
        .post(`/meetings/join/${meetingId}`)
        .then((response) => {
          axiosInstance.get(`http://localhost:4000/meetings/${clubNumber}`).then((response) => {
            let copy = [];
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i].joinMember.includes(user.userData.user.email)) {
                copy.push(true);
              } else {
                copy.push(false);
              }
            }
            setMeetingList([...response.data]);
            setMeeetingListBoolean(copy);
          });
          if (response.data.message === "참석 취소") {
            setSnackbarMessage("참석이 취소되었습니다.");
            handleSnackbarClick();
          } else {
            setSnackbarMessage("참석이 성공했습니다.");
            handleSnackbarClick();
          }
        })
        .catch((err) => {
          console.error(err);
          setSnackbarMessage("참석이 실패했습니다.");
          handleSnackbarClick();
        });
    }
  };

  useEffect(() => {
    axiosInstance.get(`http://localhost:4000/meetings/${clubNumber}`).then((response) => {
      let copy = [];
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].joinMember.includes(user.userData.user.email)) {
          copy.push(true);
        } else {
          copy.push(false);
        }
      }
      setMeetingList([...response.data]);
      setMeeetingListBoolean(copy);
    });
  }, [clubNumber, user.userData.user.email]);
  //////리엑트 쿼리

  const memberModalHandleropen = () => {
    setMemberModalOpen(true);
  };
  const memberModalHandlerClose = () => {
    setMemberModalOpen(false);
  };

  const memberModalHandleropen2 = () => {
    setMemberModalOpen2(true);
  };
  const memberModalHandlerClose2 = () => {
    setMemberModalOpen2(false);
  };

  //초대하기
  const queryClient = useQueryClient();

  const handleInvite = async (email) => {
    try {
      const response = await axiosInstance.post(`/clubs/invite/${clubNumber}`, {
        email: email, // 이메일을 서버에 전송
      });

      if (response.status === 200) {
        alert("초대를 했습니다.");
        // 모임 가입 성공 후 메시지 DB에 저장
        const message = {
          club: clubNumber,
          recipient: email,
          sender: getClub.clubs.title, // 클럽 이름
          content: `${getClub.clubs.title}에서 모임에 초대합니다.`,
          title: "모임 초대",
        };

        // 메시지 전송을 위한 액션 디스패치
        dispatch(sendMessage(message)).then(() => {
          console.log("메시지 전송 성공");
        });
        queryClient.invalidateQueries(["readClub", clubNumber, memberModalOpen, memberModalOpen2]);
      } else {
        console.error("초대 전송 실패:", response.statusText);
        alert("초대 실패: " + response.statusText);
      }
    } catch (error) {
      console.error("Error inviting to the club:", error);
      alert("초대 중 오류가 발생했습니다.");
    }
  };
  //초대하기 끝

  //최근 방문 리스트
  useEffect(() => {
    if (clubNumber && user.userData.user.email) {
      // 서버로 보낼 데이터 객체
      const body = {
        clubs: clubNumber,
        email: user.userData.user.email,
      };

      // saveVisitClub 액션 디스패치
      dispatch(saveVisitClub(body))
        .then((result) => {
          // 액션 성공 처리
          console.log("Visit saved successfully:", result);
        })
        .catch((error) => {
          // 액션 실패 처리
          console.error("Failed to save visit:", error);
        });
    }
  }, [clubNumber, user.userData.user.email, dispatch]);

  if (isLoading) {
    return <div>로딩 중...</div>; // 최초 로딩 시
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <Box sx={{ backgroundColor: "#F4F4F4" }}>
      {/* 모달창 */}
      {open && <MeetingCreate1 open={open} handleCloseModal={() => setOpen(false)} FadHandleClick={FadHandleClick} />}
      {/* 모달창.end */}

      {/* 2번째 글등록 모달창 */}
      {secondModal && <MeetingCreate2 clubNumber={clubNumber} secondModalClose={secondModalClose} secondModal={secondModal} category={category} setSnackbarMessageMain={setSnackbarMessage} handleSnackbarClickMain={handleSnackbarClick} />}
      {/* 2번째 글등록 모달창.end */}

      <Container maxWidth="md" sx={{ padding: "0px !important" }}>
        <Grid item xs={12}>
          <Box
            sx={{
              borderRadius: "10px",
              width: "100%",
              height: "478.5px",
              overflow: "hidden", // 박스 영역을 넘어서는 이미지 잘리기
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0", // 박스 배경 색상 (선택 사항)
            }}
          >
            <img
              src={`http://localhost:4000/` + readClub?.img} // 이미지 경로
              alt="Example"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // 박스 크기에 맞게 이미지 잘리기
              }}
            />
          </Box>
        </Grid>
      </Container>
      <Container maxWidth="md" sx={{ backgroundColor: "white" }}>
        {/* 모달창 버튼*/}
        {adminEmail === user.userData.user.email && (
          <>
            <Fab
              onClick={handleClick}
              aria-label="add"
              sx={{
                backgroundColor: "#DBC7B5",
                color: "white",
                position: "fixed",
                bottom: "50px",
                right: "100px",
                "&:hover": {
                  backgroundColor: "#A67153", // hover 시 배경 색상 변경
                },
              }}
            >
              <AddIcon />
            </Fab>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={handleUpdate}>모임 및 게시글 수정</MenuItem>
              <MenuItem onClick={handleDelete2}>모임 삭제</MenuItem>
            </Menu>
          </>
        )}

        {/* 모달창 버튼.end */}
        <Grid item xs={12} sx={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px" }}>
          <Grid container>
            <Grid item xs={1}>
              <Avatar sx={{ width: 50, height: 50 }} src={readClub.clubmembers[0].thumbnailImage || ""} />
            </Grid>
            <Grid item xs={11}>
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  sx={{
                    margin: "5px",
                    fontWeight: "900",
                    letterSpacing: "-.1rem",
                  }}
                >
                  {readClub.title}
                </Typography>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  호스트 <b> {readClub.adminNickName}</b>
                </Grid>
                <Grid item xs={6} sx={{ color: "#555555", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <WishHearts /> {/* WishHeart 컴포넌트를 추가합니다. */}
                  <ShareOutlinedIcon sx={{ padding: "7px", color: "black" }} />
                  <MenuIcon onClick={handleClick2} variant="contained" sx={{ padding: "7px", color: "black" }} />
                </Grid>
                <Popover
                  id={id}
                  open={open2}
                  anchorEl={anchorHeaderEl}
                  onClose={handleClose2}
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
                  {user.userData.user.email !== getClub.clubs.admin && getClub?.clubs?.members?.includes(user.userData.user.email) && (
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
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ color: "#555555" }}>
              <b> 1</b>/{readClub.maxMember}명<b> {readClub.meeting.length}</b> 정기모임
              <b> 0</b> 글 갯수
              <b> 5</b> 분 전 대화
            </Grid>
          </Grid>
          <hr />
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ marginTop: "30px" }}>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{readClub.content}</Typography>
            </Grid>
          </Grid>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#1c8a6a",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginTop: "20px",
            }}
          >
            정기 모임
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#242424",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginBottom: "20px",
            }}
          >
            정기적으로 모임을 가지고 있어요
          </Typography>
          {/* 정기 모임 */}
          {readClub.meeting.length === 0 && user.userData.user.email !== adminEmail && <Box>아직 정기모임이 없습니다.</Box>}
          {readClub.meeting.length === 0 && user.userData.user.email === adminEmail && (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ marginBottom: "30px" }}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: "16px",
                    display: "flex",
                    borderRadius: "20px",
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={12} sx={{ fontWeight: 600, fontSize: "18px" }}>
                      아직 정모가 없어요!
                    </Grid>
                    <Grid item xs={12} sx={{ marginBottom: "35px" }}>
                      정모를 만들어보세요
                    </Grid>
                    <Grid item xs={12}>
                      <CustomButton
                        variant="contained"
                        onClick={handleOpen}
                        sx={{
                          width: "100%",
                          fontSize: "18px",
                          borderRadius: "15px",
                          backgroundColor: "#DBC7B5",
                        }}
                      >
                        정모 만들기
                      </CustomButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          {readClub.meeting.map((a, i) => {
            return (
              <Grid container spacing={1} key={i}>
                <Grid item xs={12} sx={{ height: "250px", marginBottom: "30px" }}>
                  <Paper
                    elevation={2}
                    sx={{
                      padding: "16px",
                      display: "flex",
                      borderRadius: "20px",
                    }}
                  >
                    <Grid item xs={12} sm={12} md={4}>
                      <Box
                        sx={{
                          width: "250px",
                          height: "200px",
                          overflow: "hidden", // 박스 영역을 넘어서는 이미지 잘리기
                          borderRadius: "20px", // 원하는 경우 둥근 모서리 적용
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f0f0", // 박스 배경 색상 (선택 사항)
                        }}
                      >
                        <img
                          src={`http://localhost:4000/` + readClub?.meeting[i]?.img} // 이미지 경로
                          alt="Example222"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // 박스 크기에 맞게 이미지 잘리기
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <CustomButton
                          onClick={() => {
                            meetingJoin(readClub.meeting[i]._id);
                          }}
                          variant={meeetingListBoolean[i] ? "outlined" : "contained"}
                          sx={{ borderRadius: "20px", backgroundColor: "#DBC7B5", border: "0px solid", marginRight: "5px" }}
                        >
                          {meeetingListBoolean[i] ? "취소" : "참석하기"}
                        </CustomButton>
                        {user.userData.user.email === adminEmail && (
                          <CustomButton
                            variant="outlined"
                            onClick={() => {
                              deleteMeeting(readClub.meeting[i]._id);
                            }}
                            sx={{ borderRadius: "20px", border: "#DBC7B5 1px solid" }}
                          >
                            삭제하기
                          </CustomButton>
                        )}
                      </Grid>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "700",
                          fontSize: "22px",
                          color: "#383535",
                        }}
                      >
                        제목 {readClub.meeting[i].title}
                      </Typography>
                      <Box>일시 {readClub.meeting[i].dateTime}</Box>
                      <Box>위치 {readClub.meeting[i].where}</Box>
                      <Box>비용 {readClub.meeting[i].cost}</Box>

                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center", // 수직 중앙 정렬
                          margin: "10px 0px",
                        }}
                      >
                        <AvatarGroup max={4}>
                          {meetingList[i]?.joinMemberInfo.map((member, idx) => (
                            <Avatar key={idx} alt={member.img} src={member.thumbnailImage} sx={{ width: 32, height: 32 }} />
                          ))}
                        </AvatarGroup>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "8px",
                          }}
                        >
                          <PeopleRoundedIcon sx={{ fontSize: "18px" }} />
                          <span style={{ marginLeft: "5px" }}>
                            <>
                              {meetingList[i]?.joinMember?.length}/{meetingList[i]?.totalCount}
                            </>
                          </span>
                        </Box>
                      </Box>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            );
          })}
          {/* 비슷한 클럽.end */}
          {readClub.meeting.length !== 0 && user.userData.user.email === adminEmail && (
            <Grid item xs={12}>
              <CustomButton variant="contained" onClick={handleOpen} sx={{ width: "100%", fontSize: "18px", borderRadius: "15px", backgroundColor: "#DBC7B5" }}>
                정모 만들기
              </CustomButton>
            </Grid>
          )}
          <Typography
            sx={{
              fontSize: "14px",
              color: "#1c8a6a",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginTop: "20px",
            }}
          >
            가입 멤버
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#242424",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginBottom: "20px",
            }}
          >
            함께 소통하며 활동하고 있어요
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <Avatar sx={{ width: 50, height: 50 }} src={readClub.clubmembers[0].thumbnailImage || ""} />
            </Grid>
            <Grid item xs={11}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    margin: "5px",
                    fontWeight: "600",
                    letterSpacing: "-.1rem",
                  }}
                >
                  {readClub.adminNickName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                새로운 목표를 같이 달성해보고 싶어요. 서로의 고민이나 생각을 나누며 함께 성장해보고 싶어요
              </Grid>
            </Grid>
          </Grid>
          <hr></hr>
          <Box sx={{ fontSize: "18px", fontWeight: "600" }}>모임 멤버 ({readClub.members.length})</Box>
          <Grid
            item
            xs={12}
            sx={{
              height: isExpanded ? "auto" : "200px",
              overflow: "hidden",
              borderRadius: "20px",
              transition: "height 0.3s ease",
              position: "relative", // For absolute positioning of the button
              backgroundColor: "#f2f2f2",
            }}
          >
            {readClub.clubmembers &&
              readClub.clubmembers.map((member, index) => (
                <Grid container sx={{ cursor: "pointer", padding: "5px" }} key={index}>
                  <Grid item xs={1}>
                    <Avatar sx={{ width: 50, height: 50 }} src={member?.thumbnailImage || ""} />
                  </Grid>
                  <Grid item xs={4} sx={{ marginTop: "8px" }}>
                    <Typography variant="h6">{member.name}</Typography>
                  </Grid>
                  {(user.userData.user.email === adminEmail || readClub?.manager?.includes(user.userData.user.email)) && index === 0 && (
                    <Grid item xs={7} sx={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                      <CustomButton variant="contained" onClick={memberModalHandleropen} sx={{ color: "white", backgroundColor: "#DBC7B5", marginRight: "10px", borderRadius: "10px" }}>
                        멤버 관리
                      </CustomButton>
                    </Grid>
                  )}
                  {!(user.userData.user.email === adminEmail || readClub?.manager?.includes(user.userData.user.email)) && index === 0 && (
                    <Grid item xs={7} sx={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                      <CustomButton variant="contained" sx={{ color: "white", backgroundColor: "#DBC7B5", marginRight: "10px", borderRadius: "10px" }}>
                        1:1 문의하기
                      </CustomButton>
                    </Grid>
                  )}
                </Grid>
              ))}
            {readClub?.clubmembers?.length > 3 && (
              <CustomButton
                onClick={toggleExpand}
                sx={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  backgroundColor: "#DBC7B5",
                  color: "white",
                  borderRadius: "10px",
                }}
              >
                {isExpanded ? "멤버 숨기기" : "멤버 전부보기"}
              </CustomButton>
            )}
          </Grid>
          {/* 찜하기 목록 */}
          <Box sx={{ fontSize: "18px", fontWeight: "600", mt: 2 }}>찜하기 한 사람들 ({readClub.wishHeart.length})</Box>
          {adminEmail === user.userData.user.email && (
            <Grid
              item
              xs={12}
              sx={{
                height: isExpanded ? "auto" : "200px",
                overflow: "hidden",
                borderRadius: "20px",
                transition: "height 0.3s ease",
                position: "relative", // For absolute positioning of the button
                backgroundColor: "#f2f2f2",
              }}
            >
              {readClub.wishmembers &&
                readClub.wishmembers.map((member, index) => (
                  <Grid container sx={{ cursor: "pointer", padding: "5px" }} key={index}>
                    <Grid item xs={1}>
                      <Avatar sx={{ width: 50, height: 50 }} src={member?.thumbnailImage || ""} />
                    </Grid>
                    <Grid item xs={4} sx={{ marginTop: "8px" }}>
                      <Typography variant="h6">{member.name}</Typography>
                    </Grid>
                    {/* 클럽 멤버인 경우에만 이메일을 표시 */}
                    <Grid item xs={7} sx={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                      {!getClub?.clubs?.members.includes(member.email) && !member.invite.includes(getClub?.clubs?._id) && (
                        <Grid item xs={3} sx={{ marginTop: "8px" }}>
                          <CustomButton2 variant="contained" onClick={() => handleInvite(member.email)} sx={{ color: "white", marginRight: "2px", borderRadius: "10px" }}>
                            초대하기
                          </CustomButton2>
                        </Grid>
                      )}
                      {user.userData.user.email === adminEmail && index === 0 && (
                        <Grid item xs={4} sx={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                          <CustomButton variant="contained" onClick={memberModalHandleropen2} sx={{ color: "white", backgroundColor: "#DBC7B5", marginRight: "10px", borderRadius: "10px" }}>
                            멤버 관리
                          </CustomButton>
                        </Grid>
                      )}
                      {!(user.userData.user.email === adminEmail) && index === 0 && (
                        <Grid item xs={7} sx={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                          <CustomButton variant="contained" sx={{ color: "white", backgroundColor: "#DBC7B5", marginRight: "10px", borderRadius: "10px" }}>
                            1:1 문의하기
                          </CustomButton>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                ))}
              {readClub?.clubmembers?.length > 3 && (
                <CustomButton
                  onClick={toggleExpand}
                  sx={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    backgroundColor: "#DBC7B5",
                    color: "white",
                    borderRadius: "10px",
                  }}
                >
                  {isExpanded ? "멤버 숨기기" : "멤버 전부보기"}
                </CustomButton>
              )}
            </Grid>
          )}
          {/* 찜하기 목록 */}
          <Typography
            sx={{
              fontSize: "14px",
              color: "#1c8a6a",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginTop: "20px",
            }}
          >
            안내 사항
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#242424",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginBottom: "20px",
            }}
          >
            자세한 정보를 알려드릴게요
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PeopleIcon /> {readClub.maxMember}명
            </Grid>
            <Grid item xs={12}>
              <WhereToVoteIcon /> {readClub.region.neighborhood}
            </Grid>
          </Grid>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#1c8a6a",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginTop: "20px",
            }}
          >
            비슷한 클럽
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#242424",
              fontFamily: "Pretendard",
              letterSpacing: "-.1rem",
              marginBottom: "20px",
            }}
          >
            이런 클럽은 어때요
          </Typography>
          {/* 비슷한 클럽 */}
          {clubList.length > 1 ? <ClubCarousel clubList={clubList} /> : <Box sx={{ height: "200px", alignItems: "center" }}> 같은 카테고리 관련 클럽이 적습니다 </Box>}
          {/* 비슷한 클럽.end */}
        </Grid>
        {memberModalOpen && <MemberModal clubNumber={clubNumber} members={readClub.clubmembers} open={memberModalOpen} onClose={memberModalHandlerClose} />}
        {memberModalOpen2 && <MemberModal clubNumber={clubNumber} members={readClub.wishmembers} open={memberModalOpen2} onClose={memberModalHandlerClose2} />}
      </Container>
      {/* 스낵바 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000} // 사라지는 시간
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <StyledSnackbarContent message={snackbarMessage} />
      </Snackbar>
      {/* 스낵바.end */}
    </Box>
  );
};

export default Main;
