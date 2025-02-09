import React from "react";
import { Grid, Typography, IconButton } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const ChatHeader = ({ title, onFileUpload }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (onFileUpload) {
      onFileUpload(files); // 파일 업로드 핸들러 호출
    }
  };

  // 조건에 따라 제목을 잘라내는 함수
  const truncatedTitle = title.length > 16 ? `${title.slice(0, 16)}...` : title;

  return (
    <Grid container alignItems="center" justifyContent="space-between" sx={{ margin: 0, backgroundColor: "#a67153", padding: 2, borderBottom: "1px solid #c1c1c1", borderRadius: "10px 10px 0px 0px" }}>
      <Grid item>
        <Typography
          variant="h3"
          sx={{
            textAlign: "left",
            fontSize: 38,
            whiteSpace: "nowrap", // 텍스트가 한 줄로 유지되게 함
            overflow: "hidden", // 넘치는 부분을 숨김
            textOverflow: "ellipsis", // 넘치는 부분에 `...` 표시
            fontFamily: "KCC-Hanbit", // 폰트 지정
            color: "black",
          }}
        >
          {truncatedTitle ? `${truncatedTitle}` : "채팅방"}
        </Typography>
      </Grid>
      <Grid item>
        <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} id="file-upload" />
        <label htmlFor="file-upload">
          <IconButton color="primary" aria-label="add" component="span">
            <PhotoCameraIcon sx={{ color: "black", fontSize: 40 }} />
          </IconButton>
        </label>
      </Grid>
    </Grid>
  );
};

export default ChatHeader;
