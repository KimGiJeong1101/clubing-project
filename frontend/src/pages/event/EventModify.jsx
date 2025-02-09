import React, { useState, useEffect } from "react";
import CKEditor5Editor from "./EventBoardEditor"; // CKEditor5Editor 컴포넌트
import { Box, Button, Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "./../../utils/axios";
import { useSelector } from "react-redux"; // 작성자 정보를 가져오기 위한 임포트

const EventModify = ({ eventId, onClose, onNext }) => {
  // onSubmit 대신 onNext를 사용
  const [title, setTitle] = useState(""); // 제목 상태
  const [content, setContent] = useState(""); // 내용 상태
  const [image, setImage] = useState(""); // 이미지 상태 추가
  const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const userEmail = useSelector((state) => state?.user?.userData?.user?.email); // 작성자 이메일 가져오기

  useEffect(() => {
    // 수정할 이벤트 데이터를 불러오기
    const fetchEventData = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:4000/events/${eventId}`);
        const { title, content, cardImage } = response.data;
        setTitle(title);
        setContent(content);
        setImage(cardImage || ""); // 이미지가 없을 경우 기본값으로 설정
      } catch (error) {
        setSnackbarMessage("이벤트 데이터를 불러오는 데 실패했습니다.");
        setOpenSnackbar(true);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleEditorChange = (data) => {
    setContent(data); // 에디터 내용 변경
  };

  const handleNext = () => {
    // handleModify 대신 handleNext 함수
    const defaultImageUrl = "https://via.placeholder.com/400?text=No+Image"; // 기본 이미지 URL
    const finalImage = image || defaultImageUrl; // 이미지가 없으면 기본 이미지 사용

    if (title && content) {
      const eventDetails = {
        writer: userEmail, // 작성자 정보를 추가
        title,
        content,
        cardImage: finalImage,
        eventId: eventId,
        isEdit: true,
      };
      onNext(eventDetails); // 부모 컴포넌트로 데이터 넘기기
    } else {
      setSnackbarMessage("제목과 내용을 입력해주세요.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
        <CloseIcon />
      </IconButton>
      <h1>이벤트 수정</h1>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          marginTop: "1px",
          paddingRight: "10px",
        }}
      >
        <CKEditor5Editor title={title} setTitle={setTitle} content={content} onChange={handleEditorChange} setImage={setImage} />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        sx={{
          backgroundColor: "#DBC7B5", // 기본 버튼 색상
          "&:hover": {
            backgroundColor: "#A67153", // 호버 시 색상
          },
          mt: 2,
        }}
      >
        {" "}
        {/* handleModify에서 handleNext로 변경 */}
        다음
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventModify;
