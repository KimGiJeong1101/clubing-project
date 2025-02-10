import React, { useState } from "react";
import CKEditor5Editor from "./EventBoardEditor"; // CKEditor5Editor 컴포넌트
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Snackbar, Alert } from "@mui/material";

export default function EventCreate({ onClose, onNext }) {
    const [title, setTitle] = useState(""); // 제목 상태
    const [content, setContent] = useState(""); // 내용 상태
    const [image, setImage] = useState(""); // 이미지 상태 추가
    const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 상태
    const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지

    const handleEditorChange = (data) => {
        setContent(data); // 에디터 내용 변경
    };

    const handleNext = () => {
        const defaultImageUrl = "https://via.placeholder.com/400?text=No+Image"; // 기본 이미지 URL
        const finalImage = image || defaultImageUrl; // 이미지가 없으면 기본 이미지 사용

        if (title && content) {
            onNext({ title, content, image: finalImage }); // 이미지도 함께 전달
        } else {
            setOpenSnackbar(true);
            setSnackbarMessage("제목과 내용을 입력해주세요.");
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: "absolute", top: 8, right: 8 }}
            >
                <CloseIcon />
            </IconButton>
            <h1>이벤트 게시판 작성</h1>
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    marginTop: "1px",
                    paddingRight: "10px",
                }}
            >
                <CKEditor5Editor
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    onChange={handleEditorChange}
                    setImage={setImage}
                />
            </Box>

            {/* 하나의 버튼 */}
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#DBC7B5", // 기본 버튼 색상
                    "&:hover": {
                        backgroundColor: "#A67153", // 호버 시 색상
                    },
                    mt: 2,
                }}
                onClick={handleNext}
            >
                다음
            </Button>

            {/* 스낵바 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
