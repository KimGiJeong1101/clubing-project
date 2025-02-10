import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography, Avatar, Button } from "@mui/material";
import CustomButton from "../../../components/club/CustomButton";
import axiosInstance from "../../../utils/axios";
import { useSelector } from "react-redux";

const MemberModal = ({ open, onClose, members, clubNumber, setSnackbarMessage, handleSnackbarClick }) => {
  const user = useSelector((state) => state.user);
  const deleteMemberInClub = async (nickName) => {
    await axiosInstance.post(`/clubs/deleteMember/${nickName}/${clubNumber}`);
    setSnackbarMessage("강퇴 완료되었습니다.");
    handleSnackbarClick();
    onClose();
  };
  const mandateManager = async (nickName) => {
    const response = await axiosInstance.post(`/clubs/mandateManager/${nickName}/${clubNumber}`);
    if (response.data === "성공") {
      setSnackbarMessage("위임 완료되었습니다.");
      handleSnackbarClick();
      onClose();
    }
    if (response.data === "이미 있음") {
      setSnackbarMessage("이미 매니저입니다.");
      handleSnackbarClick();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "80vw", // 전체 너비의 80%로 설정
          maxWidth: "1000px", // 최대 너비를 1000px로 설정
        },
      }}
    >
      <DialogTitle>회원 정보</DialogTitle>
      <DialogContent>
        {members && members.length > 0 ? (
          members.map((member, index) => (
            <Grid
              container
              spacing={2}
              sx={{
                padding: "10px",
                width: "100%",
                cursor: "pointer", // 마우스 포인터를 손가락 모양으로 변경
                transition: "all 0.3s ease", // 부드러운 전환 효과
                "&:hover": {
                  transform: "scale(1.03)", // 호버 시 살짝 확대
                },
              }}
              key={index}
            >
              <Grid item xs={2}>
                <Avatar sx={{ width: 50, height: 50 }} src={member?.thumbnailImage || ""} />
              </Grid>
              <Grid item xs={4} sx={{ marginTop: "8px" }}>
                <Typography variant="h6">
                  {member.name} - <span style={{ color: "#888888" }}>({member.nickName}) </span>
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
                {user.userData.user.nickName === members[0].nickName && index !== 0 && (
                  <>
                    <CustomButton
                      variant="contained"
                      onClick={() => {
                        mandateManager(member.nickName);
                      }}
                      sx={{
                        color: "white",
                        backgroundColor: "#DBC7B5",
                        borderRadius: "15px",
                        height: "40px", // 버튼 높이 설정
                        padding: "0 16px", // 좌우 패딩 설정 (기본 패딩 제거)
                        display: "flex",
                        alignItems: "center", // 수직 중앙 정렬
                        justifyContent: "center", // 수평 중앙 정렬
                        marginRight: "5px",
                      }}
                    >
                      매니저 위임
                    </CustomButton>
                  </>
                )}
                {index !== 0 && (
                  <>
                    <CustomButton
                      variant="contained"
                      onClick={() => {
                        deleteMemberInClub(member.nickName);
                      }}
                      sx={{
                        color: "white",
                        backgroundColor: "#DBC7B5",
                        borderRadius: "15px",
                        height: "40px", // 버튼 높이 설정
                        padding: "0 16px", // 좌우 패딩 설정 (기본 패딩 제거)
                        display: "flex",
                        alignItems: "center", // 수직 중앙 정렬
                        justifyContent: "center", // 수평 중앙 정렬
                      }}
                    >
                      추방
                    </CustomButton>
                  </>
                )}
              </Grid>
            </Grid>
          ))
        ) : (
          <Typography>멤버 정보가 없습니다.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default MemberModal;
