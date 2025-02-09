import MyUpdate from "./sections/MyUpdate/MyUpdate"; // MyUpdate 컴포넌트를 임포트합니다.
import MyChat from "./sections/MyChat/MyChat.jsx";
import MyClub from "./sections/MyClub/MyClub.jsx";
import MySetting from "./sections/MySetting";
import MyMessage from "./sections/MyMessage/MyMessage.jsx";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt"; // Camera 아이콘
import DeleteIcon from "@mui/icons-material/Delete"; // 삭제 아이콘
import BrushIcon from "@mui/icons-material/Brush";
import { Box, Typography, Avatar, Divider, IconButton, Modal, Popover, MenuItem, Button, TextField } from "@mui/material";
import { myPage } from "../../store/actions/userActions";
import axiosInstance from "../../utils/axios";
import CustomButton from "../../components/club/CustomButton.jsx";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Badge from "@mui/material/Badge"; // 알림 뱃지

const MyPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.user?.userData?.user || {});
  //console.log("뭐들어 잇어?", user)
  //이미지 확인 모달창 열기
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // Popover 상태 관리

  // 안 읽은 메시지 숫자
  const myMessage = useSelector((state) => state.myMessage?.messages || {});
  const [unreadCount, setUnreadCount] = useState(0);

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
    { path: "", name: "모임 관리", component: <MyClub /> },
    { path: "chat", name: "채팅", component: <MyChat /> },
    { path: "myupdate", name: "회원 정보", component: <MyUpdate /> },
    { path: "mymessage", name: "메시지 함", component: <MyMessage /> },
    { path: "setting", name: "안내사항", component: <MySetting /> },
  ];

  // 선택된 섹션
  const navigate = useNavigate(); // URL을 변경할 때 사용
  const [selectedSection, setSelectedSection] = useState("");

  // URL 경로에서 /mypage 다음 값을 추출하여 상태를 설정합니다.
  useEffect(() => {
    const path = location.pathname.split("/").slice(-1)[0]; // /mypage 다음 값을 가져옵니다
    // path가 routes에 있는지 확인
    const validPath = routes.find((route) => route.path === path);
    if (validPath) {
      setSelectedSection(path);
    } else {
      // 유효한 path가 없을 경우 기본값 설정
      setSelectedSection(""); // 여기서 원하는 기본값을 설정
    }
  }, [location.pathname]);

  // 버튼 클릭 시 섹션 변경과 URL 이동
  const handleSectionClick = (to) => {
    setSelectedSection(to);
    navigate(to); // URL을 section으로 이동
  };

  useEffect(() => {
    dispatch(myPage()); // 사용자 데이터 새로고침
  }, [dispatch]);

  //이미지 확인 모달창 열기
  const handleOpen = (src) => {
    setImageSrc(src);
    setOpen(true);
  };
  //이미지 확인 모달창 닫기
  const handleClose = () => setOpen(false);

  // Popover 열기 및 닫기
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClosePopover = () => setAnchorEl(null);
  const openPopover = Boolean(anchorEl);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };
  ////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정
  const handleEditClick = async () => {
    document.getElementById("profileUpload").click(); // 파일 선택 창 열기
    handleClosePopover();

    const fileInput = document.getElementById("profileUpload");
    fileInput.addEventListener(
      "change",
      async () => {
        const selectedFile = fileInput.files[0]; // 선택된 파일

        if (selectedFile) {
          const formData = new FormData();
          formData.append("image", selectedFile); // 파일을 FormData에 추가
          try {
            await axiosInstance.put("/users/profile/image", formData, {
              headers: {
                "Content-Type": "multipart/form-data", // 요청 헤더 설정
              },
            });
            dispatch(myPage()); // 데이터 새로고침
            alert("이미지가 성공적으로 수정되었습니다.");
          } catch (error) {
            // 오류 처리
            if (error.response) {
              // 서버가 응답을 보냈으나 상태 코드가 오류인 경우
              console.error("서버 응답 오류:", error.response.data);
              alert(`이미지 수정에 실패했습니다. 오류: ${error.response.data.message || "알 수 없는 오류"}`);
            } else if (error.request) {
              // 서버에 요청을 보냈으나 응답이 없는 경우
              console.error("서버 응답 없음:", error.request);
              alert("이미지 수정 요청이 서버에 도달하지 않았습니다. 네트워크를 확인해 주세요.");
            } else {
              // 요청 설정 중 오류가 발생한 경우
              console.error("요청 설정 오류:", error.message);
              alert(`이미지 수정 요청 중 오류가 발생했습니다: ${error.message}`);
            }
          }
        }
      },
      { once: true },
    ); // 이벤트 리스너는 한 번만 실행되도록 설정
  };
  ////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정

  ////////////////////////////////////////////////// 이미지 삭제 ////////////////////////////////////////////////// 이미지 삭제////////////////////////////////////////////////// 이미지 삭제
  const handleDeleteClick = async () => {
    // 콘솔에 메시지를 출력하고 팝오버를 닫습니다.
    console.log("삭제하기 클릭");
    handleClosePopover();

    // 이미지 삭제 작업을 시도합니다.
    try {
      // 서버에 DELETE 요청을 보내 이미지 삭제를 시도합니다.
      const response = await axiosInstance.delete("/users/profile/image_del"); // 서버 URL 확인

      // 서버로부터의 응답을 기반으로 성공 메시지를 표시합니다.
      if (response.status === 200) {
        // 상태 새로 고침
        await dispatch(myPage()); // 데이터 새로 고침이 완료되도록 await
        alert("이미지가 성공적으로 삭제되었습니다.");
      } else {
        alert("이미지 삭제에 실패했습니다.");
      }
    } catch (error) {
      // 오류가 발생했을 때 콘솔에 에러를 출력하고 사용자에게 알립니다.
      console.error("이미지 삭제 중 오류 발생:", error);
      alert("이미지 삭제에 실패했습니다.");
    }
  };
  ////////////////////////////////////////////////// 이미지 삭제////////////////////////////////////////////////// 이미지 삭제////////////////////////////////////////////////// 이미지 삭제
  // 소개글 수정// 소개글 수정// 소개글 수정// 소개글 수정// 소개글 수정// 소개글 수정
  const [openModal, setOpenModal] = useState(false);
  const [newIntroduction, setNewIntroduction] = useState(user?.profilePic?.introduction || "");
  const [error, setError] = useState("");

  const introductionShowModal = () => {
    setOpenModal(true);
  };

  const introductionCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveIntroduction = async () => {
    try {
      // 소개글 업데이트 요청
      const response = await axiosInstance.put("/users/introduction", { introduction: newIntroduction });
      if (response.status === 200) {
        alert("소개가 성공적으로 업데이트되었습니다.");
        await dispatch(myPage()); // 데이터 새로 고침이 완료되도록 await
        // onUpdateIntroduction(newIntroduction); // 부모 컴포넌트에 업데이트 알림
        introductionCloseModal(); // 모달 닫기
      } else {
        // 서버에서 반환된 상태 코드가 200이 아닐 경우
        alert("소개 업데이트에 실패했습니다.");
      }
    } catch (error) {
      // 오류 처리
      if (error.response) {
        console.error("서버 응답 오류:", error.response.data);
        alert(`오류: ${error.response.data.message || "알 수 없는 오류"}`);
      } else if (error.request) {
        console.error("서버 응답 없음:", error.request);
        alert("서버에 응답이 없습니다. 네트워크를 확인해 주세요.");
      } else {
        console.error("요청 설정 오류:", error.message);
        alert(`요청 오류: ${error.message}`);
      }
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 30) {
      setError("소개글은 30자 이하로 작성해야 합니다.");
    } else {
      setError("");
      setNewIntroduction(value);
    }
  };
  // 소개글 수정 끝// 끝 소개글 수정 끝// 소개글 수정 끝////////////////////////////////////
  ////카테고리 show////카테고리 show////카테고리 show////카테고리 show
  const [showAll, setShowAll] = useState(false);
  const visibleCount = 6;

  // 카테고리 데이터 준비
  const categories = user?.category || [];

  // 모든 서브 카테고리 평탄화
  const flattenedSubCategories = categories.flatMap((cat) => cat.sub || []);

  // 표시할 카테고리 수 결정
  const displayedSubCategories = showAll ? flattenedSubCategories : flattenedSubCategories.slice(0, visibleCount);

  // 나머지 카테고리 수 계산
  const remainingCount = flattenedSubCategories.length - visibleCount;

  // 이미지 미리보기 모달
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    height: 500,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // 열 방향으로 정렬
        justifyContent: "flex-start", // 상단에 붙게 설정
        alignItems: "center",
        width: "auto", // 자식 요소에 맞춰 너비 자동 조정
        minHeight: "170vh", //여기 수정해야됌요
        height: "auto", // 자식 요소 높이에 따라 자동 조정
        p: 2, // 패딩 추가
        position: "relative", // 상위 요소에 상대적인 위치
      }}
    >
      {/* 컨텐츠 박스 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row", // 가로 방향으로 배치
          width: 1200,
          height: "100vh", // 충분한 높이를 설정
        }}
      >
        {/* 왼쪽 프로필 및 추가 섹션 버튼 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // 열 방향으로 정렬
            alignItems: "center",
            minHeight: "100vh", // 전체 높이 설정
            width: 450, // 고정 너비
            bgcolor: "white", // 배경색 설정
            position: "sticky", // 스크롤 시 상단에 붙게 함
            top: 0, // 상단에 고정
            zIndex: 1, // 다른 요소보다 위에 배치
            overflow: "hidden", // 내용이 넘어가면 숨김
            maxHeight: "100vh", // 화면 높이를 넘지 않도록 설정
            borderRadius: 5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mt: 6, // 상단 여백
              minWidth: 400, // 최소 너비 설정
              mx: "auto", // 자동 좌우 여백
            }}
          >
            {/* 프로필 헤더 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                position: "relative",
              }}
            >
              {/* 프로필 이미지 */}
              <Box sx={{ position: "relative" }}>
                <Avatar sx={{ width: 130, height: 130, cursor: "pointer" }} src={user?.profilePic?.thumbnailImage || ""} onClick={() => handleOpen(user?.profilePic?.originalImage || "")} />
                <Box sx={{ position: "relative" }}>
                  {/* 이미지 수정 버튼 */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      borderRadius: "50%",
                      width: 34,
                      height: 34,
                      boxShadow: 1,
                      "&:hover": {
                        bgcolor: "grey.200",
                      },
                    }}
                    onClick={handleClick} // 이미지 수정 버튼 클릭 시 호출
                  >
                    <CameraAltIcon />
                  </IconButton>

                  {/* 수정 삭제 선택 */}
                  <Popover
                    open={Boolean(openPopover)}
                    anchorEl={anchorEl}
                    onClose={handleClosePopover}
                    sx={{
                      "& .MuiPopover-paper": {
                        borderRadius: "15px",
                        border: "1px solid #A9A9A9",
                        bgcolor: "#D3D3D3",
                        p: 1,
                        marginLeft: 4,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <MenuItem onClick={handleEditClick}>
                        <BrushIcon sx={{ mr: 1 }} />
                        수정하기
                      </MenuItem>
                      <MenuItem onClick={handleDeleteClick}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        삭제하기
                      </MenuItem>
                    </Box>
                  </Popover>

                  {/* 파일 입력 요소 */}
                  <input accept="image/*" type="file" style={{ display: "none" }} id="profileUpload" />
                </Box>
              </Box>

              {/* 사용자 정보 */}
              <Box
                sx={{
                  ml: 3,
                  width: 250,
                }}
              >
                <Typography variant="h6">{user?.name || ""}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.homeLocation ? `${user.homeLocation.city || ""} ` : "거주지 정보 없음"}•{"  "}
                  {user?.age ? `${user.age.year || ""}년 ${user.age.month || ""}월 ${user.age.day || ""}일` : "나이 정보 없음"}
                </Typography>

                {/* 프로필 소개 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center", // 수직 가운데 정렬
                    justifyContent: "space-between", // 양 끝으로 요소 배치
                    mt: 2, // 상단 여백
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {user?.profilePic?.introduction || "소개글이 없습니다."}
                  </Typography>
                  {/* 대화명 수정 버튼 */}
                  <IconButton
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      boxShadow: 1,
                      "&:hover": {
                        bgcolor: "grey.200",
                      },
                    }}
                    onClick={introductionShowModal}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                {/* 소개글 수정하기 모달 */}
                {/* 수정 모달 */}
                <Modal open={openModal} onClose={introductionCloseModal} aria-labelledby="modal-title" aria-describedby="modal-description">
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 400,
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: 2,
                    }}
                  >
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={newIntroduction}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      error={!!error} // 에러 상태에 따라 텍스트 필드의 에러 표시 여부 결정
                      helperText={error} // 에러 메시지
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button onClick={handleSaveIntroduction} variant="contained">
                        변경하기
                      </Button>

                      <Button onClick={introductionCloseModal} variant="outlined">
                        취소하기
                      </Button>
                    </Box>
                    <IconButton
                      onClick={introductionCloseModal}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: "background.paper",
                        borderRadius: "50%",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Modal>

                {/* Category Section */}
                <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {displayedSubCategories.map((sub, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          py: 0.5,
                          bgcolor: "#D3D3D3",
                          color: "black",
                          borderRadius: "15px",
                          border: "1px solid",
                          borderColor: "#A9A9A9",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          "&:hover": {
                            bgcolor: "#C0C0C0",
                            borderColor: "#808080",
                          },
                        }}
                      >
                        <Typography variant="body2">{sub}</Typography>
                      </Box>
                    ))}
                    {!showAll && remainingCount > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          py: 0.5,
                          bgcolor: "#D3D3D3",
                          color: "black",
                          borderRadius: "20px",
                          border: "1px solid",
                          borderColor: "#A9A9A9",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          "&:hover": {
                            bgcolor: "#C0C0C0",
                            borderColor: "#808080",
                          },
                        }}
                      >
                        <IconButton onClick={() => setShowAll(true)}>
                          <Typography variant="body2">+{remainingCount}</Typography>
                        </IconButton>
                      </Box>
                    )}
                    {showAll && remainingCount > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          py: 0.5,
                          bgcolor: "#D3D3D3",
                          color: "black",
                          borderRadius: "15px",
                          border: "1px solid",
                          borderColor: "#A9A9A9",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          "&:hover": {
                            bgcolor: "#C0C0C0",
                            borderColor: "#808080",
                          },
                        }}
                      >
                        <IconButton onClick={() => setShowAll(false)}>
                          <Typography variant="body2">접기</Typography>
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* 버튼 클릭 시 오른쪽 섹션 열기 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 2,
                width: "100%", // 부모 요소의 넓이를 100%로 설정
              }}
            >
              {routes.map((route) => (
                <Box key={route.path} sx={{ position: "relative", width: "100%" }}>
                  <CustomButton
                    variant="contained"
                    onClick={() => handleSectionClick(route.path)}
                    sx={{
                      mb: 1,
                      fontSize: "1rem",
                      px: 3,
                      py: 1.5,
                      width: "100%",
                      height: "40px",
                      position: "relative",
                      variant: selectedSection === route.path ? "contained" : "outlined",
                      backgroundColor: selectedSection === route.path ? "#A67153" : "#DBC7B5",
                      color: selectedSection === route.path ? "#fff" : "#30231C",
                      "&:hover": {
                        backgroundColor: selectedSection === route.path ? "#A6836F" : "#A67153",
                      },
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        width: selectedSection === route.path ? "100%" : "0%",
                        height: "2px",
                        backgroundColor: "#595959",
                        transform: "translateX(-50%)",
                        transition: "width 0.3s ease",
                      },
                    }} // 버튼 스타일 적용
                  >
                    {route.name}
                  </CustomButton>
                  <Badge
                    badgeContent={route.path === "mymessage" && unreadCount > 0 ? unreadCount : null} // "메시지 함" 버튼에만 배지 표시
                    color="error"
                    sx={{
                      "& .MuiBadge-dot": {
                        backgroundColor: "red",
                        width: 20,
                        height: 20,
                        right: 5, // 조정 필요
                        borderRadius: "50%",
                      },
                      ".MuiBadge-root": {
                        position: "absolute", // 버튼의 오른쪽 위에 배지 위치 조정
                        top: 0,
                        right: 0,
                        transform: "translate(-50%, -50%)", // 배지를 버튼의 중앙에 위치하도록 조정
                      },
                    }}
                  ></Badge>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* 오른쪽 섹션 */}
        <Box
          sx={{
            height: "auto",
            flexGrow: 2,
            p: 2,
          }}
        >
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.component} />
            ))}
          </Routes>
        </Box>

        {/* 이미지 미리보기 모달 */}
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
          <Box sx={modalStyle}>
            <img src={imageSrc} alt="Profile Preview" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            <IconButton
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "background.paper",
                borderRadius: "50%",
              }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default MyPage;
