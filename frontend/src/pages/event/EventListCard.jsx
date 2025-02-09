import React, { useState } from "react";
import { Card, CardMedia, Box, CardContent, Typography, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector } from "react-redux";
import axiosInstance from "./../../utils/axios";
import { useMutation } from "@tanstack/react-query";
import { Snackbar, Alert } from "@mui/material"; // Snackbar for success/error messages
import axios from "axios";

const EventListCard = ({ event, onEdit, onDelete, onImageClick }) => {
  const displayImage = event.cardImage || "https://via.placeholder.com/345x140?text=No+Image";
  const cardTitle = event.cardTitle || event.title || "기본 타이틀";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const userEmail = useSelector((state) => state?.user?.userData?.user?.email);

  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar 상태 관리
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(event);
    }
  };

  // 조회수 증가 함수
  const increaseViews = async (eventId) => {
    try {
      console.log(`조회수 증가 함수 호출됨: 이벤트 ID - ${eventId}`); // 디버깅 로그 추가
      const response = await axios.patch(`http://localhost:4000/events/${eventId}/views`);
      console.log("조회수 증가 응답:", response.data); // 서버 응답 로그 추가
    } catch (error) {
      console.error("조회수 증가 오류:", error);
    }
  };

  // React Query의 useMutation 훅을 사용하여 삭제 처리
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`http://localhost:4000/events/${event._id}`, {
        data: { email: userEmail },
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("삭제 성공:", data);
      setSnackbarMessage("이벤트가 성공적으로 삭제되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      if (onDelete) {
        onDelete(event._id); // 삭제 성공 후 부모 컴포넌트에 알림
      }
    },
    onError: (error) => {
      console.error("삭제 실패:", error);
      setSnackbarMessage("이벤트 삭제에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleDelete = () => {
    handleMenuClose();
    mutation.mutate(); // 삭제 요청 실행
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // 이미지 클릭 시 조회수 증가 후 상세 페이지로 이동
  const handleImageClick = () => {
    increaseViews(event._id); // event._id를 사용하여 조회수 증가
    if (onImageClick) {
      onImageClick(); // 상세 페이지 이동
    }
  };

  return (
    <>
      <Card sx={{ width: "350px", height: "auto", margin: 0, backgroundColor: "#f0f0f0" }}>
        <CardMedia
          component="img"
          alt={event.title || "이미지 없음"}
          height="200"
          image={displayImage}
          onClick={handleImageClick} // 이미지 클릭 시 조회수 증가 및 상세 페이지 이동
          sx={{ cursor: "pointer", objectFit: "cover", width: "100%", height: "200px" }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px", margin: "10px", backgroundColor: "#f0f0f0", position: "relative" }}>
          <CardContent sx={{ padding: 0, flex: 1 }}>
            <Typography
              variant="body2"
              color="black"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                whiteSpace: "normal",
              }}
            >
              {cardTitle}
            </Typography>
          </CardContent>
          <MoreVertIcon sx={{ fontSize: 28, cursor: "pointer", marginLeft: "8px" }} onClick={handleMenuOpen} />
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: "top", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} disableScrollLock={true}>
            <MenuItem onClick={handleEdit}>수정하기</MenuItem>
            <MenuItem onClick={handleDelete}>삭제하기</MenuItem>
          </Menu>
        </Box>
        <Box sx={{ padding: "0 20px", backgroundColor: "#f0f0f0", mb: "20px" }}>
          <Typography fontSize={10}>조회수 : {event.views || 0}</Typography>
          <Typography fontSize={10}>등록날짜 :{event.createdAt ? new Date(event.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "날짜 정보 없음"}</Typography>
          <Typography fontSize={10}>종료날짜 :{event.endTime ? new Date(event.endTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "선택되지 않음"}</Typography>
        </Box>
      </Card>

      {/* Snackbar for success/error notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventListCard;
