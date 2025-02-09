import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import { useNavigate } from "react-router-dom";

const ClubListCard = ({ clubList }) => {
  
  const navigate = useNavigate();
    // clubList가 undefined인 경우를 처리
    if (!clubList || clubList.length === 0) {
      return <div>No clubs available</div>;
    }
  return (
    <>
      {clubList.map((club) => (
        <Grid item xs={12} sm={6} md={4} key={club._id} sx={{}}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: "20px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              backgroundColor: "white",
              boxShadow: "none", // 그림자 제거
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "300px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={`http://localhost:4000/` + club.img}
                alt={club.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "20px 20px 0 0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "#f2f2f2",
                  width: "150px",
                  height: "40px",
                  paddingBottom: "18px",
                  borderBottom: "15px solid #f2f2f2",
                  borderLeft: "15px solid #f2f2f2",
                  borderBottomLeftRadius: "20px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    marginTop: "5px",
                    marginLeft: "5px",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "130px",
                    height: "50px",
                    color: "#A6836F",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    backgroundColor: "white",
                  }}
                >
                  {club.mainCategory}
                </Box>
              </Box>
              {/* 지옥의 둥굴게 말기.... */}
              <ModeNightIcon
                sx={{
                  position: "absolute",
                  top: 49,
                  right: -24,
                  color: "#f2f2f2",
                  zIndex: 3,
                  fontSize: "50px",
                  transform: "rotate(-45deg)",
                }}
              />
              <ModeNightIcon
                sx={{
                  position: "absolute",
                  top: -23,
                  right: 141,
                  color: "#f2f2f2",
                  zIndex: 3,
                  fontSize: "50px",
                  transform: "rotate(-45deg)",
                }}
              />
            </Box>
            <Box
              sx={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                height: "200px",
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "700",
                  fontSize: "20px",
                  color: "#383535",
                  marginBottom: "8px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {club.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "500",
                  fontSize: "18px",
                  color: "#777777",
                  marginBottom: "8px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {club.subTitle}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#9F9E9D",
                  marginBottom: "8px",
                }}
              >
                {club.region.district}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CommentRoundedIcon sx={{ color: "#BF5B16", fontSize: "18px" }} />
                <Typography variant="body2" sx={{ color: "#BF5B16", marginLeft: "5px" }}>
                  5분 전 대화
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "auto",
                  borderTop: "1px solid #e0e0e0",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                }}
              >
                <AvatarGroup max={4}>
                  {club.memberInfo.map((member, idx) => (
                    <Avatar key={idx} alt={member.img} src={member.thumbnailImage} sx={{ width: 32, height: 32 }} />
                  ))}
                </AvatarGroup>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "8px",
                    fontSize: "16px",
                    color: "#666666",
                  }}
                >
                  <PeopleRoundedIcon sx={{ fontSize: "18px" }} />
                  <span style={{ marginLeft: "5px" }}>
                    {club.members.length}/{club.maxMember}
                  </span>
                </Box>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  bottom: -5,
                  right: 0,
                  backgroundColor: "#f2f2f2",
                  width: "65px",
                  height: "60px",
                  paddingTop: "10px",
                  borderBottom: "15px solid #f2f2f2",
                  borderLeft: "15px solid #f2f2f2",
                  borderTopLeftRadius: "20px",
                }}
                onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
              >
                <Box
                  sx={{
                    display: "flex",
                    marginTop: "5px",
                    marginRight: "5px",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "50px",
                    height: "50px",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "25px",
                    backgroundColor: "#A6836F",
                    transition: "all 0.3s ease", // 모든 속성에 대해 부드럽게 변환
                    "&:hover": {
                      transform: "scale(1.2)", // 호버 시 크기 확대
                      color: "#f2f2f2", // 색상 변경
                      backgroundColor: "#A67153", // 배경색 변경
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // 그림자 추가
                      cursor: "pointer",
                    },
                  }}
                >
                  <ArrowForwardIcon sx={{ color: "white" }} />
                </Box>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: -0,
                  right: 80,
                  backgroundColor: "white",
                  width: "20px",
                  height: "20px",
                  zIndex: 3,
                  borderBottomRightRadius: "50px", // 둥근 모서리 적용
                }}
              ></Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: -0,
                  right: 80,
                  backgroundColor: "#f2f2f2",
                  width: "20px",
                  height: "20px",
                  zIndex: 2,
                }}
              ></Box>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 80,
                  right: 0,
                  backgroundColor: "white",
                  width: "20px",
                  height: "20px",
                  zIndex: 3,
                  borderBottomRightRadius: "50px", // 둥근 모서리 적용
                }}
              ></Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 78,
                  right: 0,
                  backgroundColor: "#f2f2f2",
                  width: "20px",
                  height: "20px",
                  zIndex: 2,
                }}
              ></Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </>
  );
};

export default ClubListCard;