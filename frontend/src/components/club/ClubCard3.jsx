import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { makeEnterChat } from "../../store/actions/chatActions.js";
import axios from "axios";

const ClubCard3 = ({ clubList }) => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.userData?.user?._id);

  const handleClickChat = async (clubId) => {
    try {
      if (!userId) {
        console.error("User ID is missing.");
        return;
      }

      const participants = [userId];
      const actionResult = await dispatch(makeEnterChat({ clubId, participants }));

      const chattingRoom = actionResult.payload;
      if (!chattingRoom) {
        throw new Error("채팅방 정보를 불러오는 데 실패했습니다.");
      }

      navigate(`/clubs/chat?clubNumber=${clubId}`);
    } catch (error) {
      console.error("Error entering chat room:", error.message || error);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {clubList.map((club, index) => (
          <Grid
            item
            md={11}
            key={club._id}
            sx={{
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
              },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                width: "480px",
                height: "205px",
                cursor: "pointer",
                transition: "box-shadow 0.3s ease",
                backgroundColor: "white",
                position: "relative",
              }}
              onClick={() => handleClickChat(club._id)}
            >
              <Grid container spacing={3}>
                <Grid item xs={7}>
                  <Box
                    sx={{
                      padding: "8px", // padding을 줄였습니다.
                      display: "flex",
                      flexDirection: "column",
                      height: "182px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "700",
                        fontSize: "20px",
                        color: "#383535",
                        marginBottom: "2px", // marginBottom을 줄였습니다.
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {club.title}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "auto",
                        borderTop: "1px solid #e0e0e0",
                        paddingTop: "1px",
                        paddingBottom: "1px",
                      }}
                    >

                      
                      <AvatarGroup max={4}>
                        {club.memberInfo.map((member, idx) => (
                          <Avatar
                            key={idx}
                            alt={`Member ${idx + 1}`}
                            src={member.profilePic} // memberInfo에서 profilePic 사용
                            sx={{ width: 32, height: 32 }}
                          />
                        ))}
                      </AvatarGroup>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "8px",
                          fontSize: "14px",
                          color: "#666666",
                        }}
                      >
                        <PeopleRoundedIcon sx={{ fontSize: "18px" }} />
                        <span style={{ marginLeft: "5px" }}>
                          {club.members.length}/{club.maxMember}
                        </span>
                      </Box>
                    </Box>

                    {club.admin === user.email && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "#BF5B16",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          zIndex: 1,
                        }}
                      >
                        내가 만든 모임
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClubCard3;
