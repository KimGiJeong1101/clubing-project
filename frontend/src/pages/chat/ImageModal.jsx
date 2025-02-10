import React from "react";
import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageModal = ({ open, onClose, imageUrl }) => {
  // 모달 열림 상태 로그
  React.useEffect(() => {
    console.log("모달 열림 상태:", open);
  }, [open]);

  // 모달을 닫을 때 로그
  const handleClose = () => {
    console.log("모달 닫기 클릭");
    onClose();
  };

  // 배경 클릭 시 로그
  const handleBackdropClick = () => {
    console.log("모달 배경 클릭");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleBackdropClick} // 배경 클릭 시 모달 닫기
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "none",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          backgroundColor: "transparent", // 배경색을 투명으로 설정
          padding: 0,
          border: "none", // 경계선 제거
          boxShadow: "none", // 그림자 제거
        }}
      >
        <img
          src={imageUrl}
          alt="Full size"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            objectFit: "contain",
            border: "none", // 이미지 경계선 제거
            outline: "none", // 이미지 외곽선 제거
          }}
        />
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default ImageModal;
