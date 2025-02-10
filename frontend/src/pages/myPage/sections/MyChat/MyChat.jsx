import React from "react";
import { Box, Typography } from "@mui/material";
import MyChatList from "./MyChatList";

const MyChat = () => {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* 콘텐츠 영역 */}
      <Box
        sx={{
          p: 3,
          bgcolor: "#e0e0e0", // 배경 색상
          borderRadius: 2,
          boxShadow: 3,
          transition: "background-color 0.3s ease",
        }}
      >
        <Box
          sx={{
            bgcolor: "#dbc7b5", // 부드러운 배경색
            textAlign: "center", // 텍스트 가운데 정렬
            p: 2, // 패딩 추가
            mb: 3, // 아래쪽 마진 추가
            borderRadius: 1, // 살짝 둥근 모서리
            boxShadow: 1, // 약간의 그림자 추가
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", color: "#666666", fontFamily: "KCC-Hanbit" }}>
            채팅방 리스트
          </Typography>
        </Box>
        <MyChatList /> {/* MyChatList 컴포넌트를 직접 렌더링 */}
      </Box>
    </Box>
  );
};

export default MyChat;
