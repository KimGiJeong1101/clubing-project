import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import club from "../../data/Club.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axios.js";
import CustomButton2 from "../../components/club/CustomButton2.jsx";
import CustomSnackbar from "../../components/auth/Snackbar";

const ClubCard2 = ({ clubList }) => {
  const [list, setList] = useState(club);
  const [userInvite, setUserInvite] = useState([]); // userInvite 상태 추가
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [loading, setLoading] = useState(true); // 로딩 상태
  console.log(user.email);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching user invites...");
    const fetchUserInvite = async () => {
      try {
        // 유저의 초대 목록을 가져오기 위한 API 호출
        const response = await axiosInstance.get("/users/myPage");
        const userData = response.data.user;

        setUserInvite(userData.invite || []); // 초대 목록 설정
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setLoading(false); // 에러 발생 시 로딩 종료
      }
    };

    fetchUserInvite();
  }, [user.email]); // 의존성 배열에 user.email 추가

  const handleRejectInvite = async (clubId) => {
    try {
      // 서버에 초대 거절 요청
      await axiosInstance.post(`/users/reject-invite`, { clubId });

      // 성공 알림 표시
      setSnackbarMessage("초대가 거절되었습니다.");
      setSnackbarSeverity("success");
      setTimeout(() => {
        window.location.reload(); // 페이지 새로고침
      }, 1000); // 1초 후 새로고침
    } catch (error) {
      console.error("Error rejecting invite:", error);

      // 실패 알림 표시
      setSnackbarMessage("초대 거절 중 오류가 발생했습니다.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true); // 스낵바 열기
    }
  };

  // 스낵바 상태를 추가합니다.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
                position: "relative", // Paper의 상대적인 위치 기준 설정
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
              onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
            >
              {/* 클럽 */}
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box sx={{ display: "flexed", position: "relative" }}>
                    <img
                      src={`http://localhost:4000/` + club.img}
                      alt={club.title}
                      style={{
                        width: "190px",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        marginLeft: "10px",
                        marginTop: "10px",
                        border: "1px solid #F2F2F2", // 테두리 추가
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Box
                    sx={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      height: "182px",
                    }}
                  >
                    {/* 클럽 제목 */}
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
                    {/* 클럽 제목.end */}
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
                        {list[index].chat}
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
                        {club.members.map((member, idx) => (
                          <Avatar key={idx} alt={`Member ${idx + 1}`} src={member.img} sx={{ width: 32, height: 32 }} />
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
                      {userInvite && (
                        <CustomButton2
                          onClick={(e) => {
                            e.stopPropagation(); // 상위 Paper의 클릭 이벤트 전파 방지
                            handleRejectInvite(club._id); // 초대 거절 핸들러 호출
                          }}
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: "15px", // 하단에 위치
                            right: "15px", // 오른쪽에 위치
                            color: "white",
                            padding: "6px 12px", // 패딩을 키워서 버튼을 더 크게
                            borderRadius: "4px",
                            fontSize: "14px", // 폰트 사이즈를 키워서 버튼을 더 크고 가독성 좋게
                            zIndex: 10, // 버튼이 다른 요소 위에 표시되도록 설정
                          }}
                        >
                          거절하기
                        </CustomButton2>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage} // 상태에서 전달
        severity={snackbarSeverity} // 상태에서 전달
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default ClubCard2;
