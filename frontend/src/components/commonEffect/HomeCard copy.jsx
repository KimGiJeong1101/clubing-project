import React from "react";
import { Card, CardActions, Button, Avatar, Typography, Box, IconButton, Divider } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const HomeCard = ({ club }) => {
  // club 데이터가 없을 경우 방어 코드
  if (!club) {
    return <div>No club data available</div>;
  }

  const { adminImage, memberImages, title, subTitle, img } = club;

  // 이미지 경로에 http://localhost:4000을 붙여줌
  const fullImageUrl = img ? `http://localhost:4000/${img}` : "https://via.placeholder.com/320x150";

  return (
    <Card variant="outlined" sx={{ width: 320, height: 240, borderRadius: 2, borderColor: "#d0d7de", margin: 1 }}>
      {/* 두 개의 CardContent를 합친 영역에 배경 이미지 적용 */}
      <Box
        sx={{
          height: 150, // 원하는 높이 설정
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundImage: `url(${fullImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: 2,
        }}
      >
        {/* Admin 이미지와 클럽 정보 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            alt="Admin"
            src={adminImage || "https://via.placeholder.com/56"} // adminImage가 없을 경우 기본 이미지 사용
            sx={{
              width: 56,
              height: 56,
              border: "2px solid white", // 하얀색 외곽선 추가
            }}
          />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "white",
                fontWeight: "bold", // 글씨 굵게
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)", // 외곽선 효과
              }}
            >
              {title || "Unknown Club"}
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5}>
              {/* 추가 멤버 이미지 표시 */}
              {memberImages &&
                memberImages.slice(0, 3).map((image, idx) => (
                  <Avatar
                    key={idx}
                    src={image || "https://via.placeholder.com/24"}
                    sx={{
                      width: 24,
                      height: 24,
                      border: "1px solid white", // 추가 멤버 이미지에 하얀색 외곽선 추가
                    }}
                  />
                ))}
              {memberImages && memberImages.length > 3 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)", // 외곽선 효과
                  }}
                >
                  +{memberImages.length - 3}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* 클럽 설명 */}
        <Typography
          variant="body2"
          sx={{
            fontSize: "12px",
            mt: 1,
            color: "white",
            fontWeight: "bold", // 글씨 굵게
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)", // 외곽선 효과
          }}
        >
          {subTitle || "No description available"}
        </Typography>
      </Box>

      <Divider />

      <CardActions>
        <IconButton aria-label="favorite">
          <FavoriteBorderIcon />
        </IconButton>
        <Button
          size="small"
          variant="outlined"
          sx={{
            flexGrow: 1,
            backgroundColor: "#DBC7B5", // 기본 배경색
            color: "#fff", // 글씨색 하얀색
            fontWeight: "bold", // 글씨 굵게
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)", // 외곽선 효과
            borderColor: "black", // 아웃라인을 검은색으로 설정
            "&:hover": {
              backgroundColor: "#A67153", // 호버 시 배경색
              borderColor: "black", // 호버 시 아웃라인 유지
            },
          }}
        >
          View
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: "#6E3C21", // 기본 배경색
            color: "#fff", // 글씨색 하얀색
            fontWeight: "bold", // 글씨 굵게
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)", // 외곽선 효과
            borderColor: "black",
            "&:hover": {
              backgroundColor: "#A67153", // 호버 시 배경색
            },
          }}
        >
          Join
        </Button>
      </CardActions>
    </Card>
  );
};

export default HomeCard;
