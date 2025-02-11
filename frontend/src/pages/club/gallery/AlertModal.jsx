import React from "react";
import { Modal, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Box } from "@mui/system";

const AlertModal = ({ open, handleClose, handleConfirm, title, description, confirmText = "확인", cancelText = "취소" }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-description"
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box
        component={motion.div}
        initial={{ x: "100vw", y: 100 }} // 초기 위치: 화면 오른쪽에서
        animate={{
          x: ["100vw", "60vw", "20vw", "0vw", "-50%"], // 단계별 이동
          y: [1000, -1000, 500, -500, 300, -100, 0], // 더 높이 튕기는 동작
        }}
        transition={{
          duration: 1.3, // 전체 애니메이션 지속 시간
          ease: "easeOut", // 점차 속도가 줄어드는 곡선
          bounce: 0.5, // 튕기는 효과의 강도
          stiffness: 500, // 스프링 강도
          damping: 50, // 저항으로 인해 튕김이 서서히 줄어들도록
        }}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography id="alert-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="alert-modal-description" sx={{ mt: 2 }}>
          {description}
        </Typography>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#6E3C21", // 삭제 버튼 기본 색상
              "&:hover": {
                backgroundColor: "#A67153", // 삭제 버튼 호버 색상
              },
            }}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
          {cancelText && (
            <Button
              variant="contained"
              sx={{
                color: "white",
                backgroundColor: "#DBC7B5", // 취소 버튼 기본 색상
                "&:hover": {
                  backgroundColor: "#A67153", // 취소 버튼 호버 색상
                },
              }}
              onClick={handleClose}
            >
              {cancelText}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AlertModal;
