import { Button, Snackbar, Alert } from "@mui/material";
import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// 스타일 객체 정의
const modalStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)", // 반투명 배경
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // 수직 중앙 정렬
    zIndex: 11000, // 다른 요소 위에 표시되도록
};

const modalContentStyles = {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "90%", // 모달 최대 너비를 화면 너비의 90%로 제한
    maxHeight: "90%", // 모달 최대 높이를 화면 높이의 90%로 제한
    overflow: "hidden", // 넘치는 내용 숨기기
    position: "relative", // 버튼의 절대 위치 설정을 위한 상대 위치
};

const closeButtonStyles = {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "white",
    color: "black",
    border: "black solid 1px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "20px",
    height: "30px",
    zIndex: 11001, // 버튼이 다른 요소 위에 표시되도록
};

const cropButtonStyles = {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "white",
    color: "black",
    border: "black solid 1px",
    borderRadius: "10px",
    cursor: "pointer",
    zIndex: 11001, // 버튼이 다른 요소 위에 표시되도록
};

// 이미지 크롭퍼 컴포넌트
const EventImageCropper = ({ src, onCropComplete, onClose }) => {
    const [crop, setCrop] = useState({
        unit: "px",
        width: 400,
        height: 225,
        x: 0,
        y: 0,
        aspect: 16 / 9,
    });

    const [completedCrop, setCompletedCrop] = useState(null);
    const [image, setImage] = useState(null);
    const [modalSize, setModalSize] = useState({ width: "auto", height: "auto" });

    // Snackbar 상태 관리 변수
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("warning");

    const onLoad = (e) => {
        const img = e.target;
        setImage(img);
        // 이미지 크기에 맞게 모달 크기 설정
        setModalSize({
            width: img.naturalWidth > 600 ? "90%" : `${img.naturalWidth}px`,
            height: img.naturalHeight > 400 ? "auto" : `${img.naturalHeight}px`,
        });
    };

    const handleCropChange = (newCrop) => {
        setCrop(newCrop);
    };

    const handleCropComplete = (c) => {
        setCompletedCrop(c);
    };

    const handleConfirmCrop = () => {
        if (image && completedCrop && completedCrop.width && completedCrop.height) {
            const canvas = document.createElement("canvas");
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            canvas.width = completedCrop.width;
            canvas.height = completedCrop.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height
            );
            canvas.toBlob((blob) => {
                const croppedImageUrl = URL.createObjectURL(blob);
                onCropComplete(croppedImageUrl); // 크롭된 이미지 전달
                onClose(); // 모달 닫기
            }, "image/jpeg");
        } else {
            // 크롭 영역이 설정되지 않았을 때 경고 메시지
            setSnackbarMessage("영역을 움직여서 이미지를 설정해주세요");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
        }
    };

    // Snackbar 닫기 핸들러
    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <div style={modalStyles}>
            <div style={{ ...modalContentStyles, ...modalSize }}>
                <Button onClick={onClose} variant="outlined" style={closeButtonStyles}>
                    X
                </Button>
                <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    style={{ width: "100%", height: "100%" }}
                >
                    <img
                        src={src}
                        alt="Source"
                        onLoad={onLoad}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            maxWidth: "100%",
                            maxHeight: "100%",
                        }}
                    />
                </ReactCrop>
                <Button onClick={handleConfirmCrop} style={cropButtonStyles}>
                    완료
                </Button>

                {/* Snackbar 컴포넌트 */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default EventImageCropper;
