import { Box, Button, Checkbox, Grid, Modal, Snackbar, SnackbarContent, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국어 로케일 import
import axiosInstance from "./../../../utils/axios";
import CustomButton from "../../../components/club/CustomButton.jsx";
import { useNavigate } from "react-router-dom";
import MeetingImageCropper from "./MeetingImageCropper.jsx";
import CropIcon from "@mui/icons-material/Crop";
import { styled } from "@mui/system";

dayjs.locale("ko");

const MeetingCreate2 = ({ clubNumber, secondModalClose, secondModal, category, setSnackbarMessageMain, handleSnackbarClickMain }) => {
  //////////////스낵바
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar 메시지 관리

  const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
    backgroundColor: "white", // 배경색 설정
    color: "#A6836F", // 텍스트 색상 설정
    borderRadius: "20px",
    width: "250px",
    height: "50px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 1, // 초기 투명도
    transition: "opacity 0.5s ease-in-out", // 애니메이션 효과
  }));

  const handleSnackbarClick = () => {
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  /////////스낵바 .end
  //정기모임 글 등록, 두번쨰 모달
  const [dateTime, setDateTime] = useState(null);
  const [dateTimeSort, setDateTimeSort] = useState(null);
  const [checked, setChecked] = useState(false); // 정기모임 전체알림 스테이트
  const navigate = useNavigate();
  const checkedChange = (event) => {
    setChecked(event.target.checked);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ mode: "onChange" });

  ///비교삭제 추가하기
  const onSubmit = async (data) => {
    const blob = await blobUrlToBlob(preview);
    const file = blobToFile(blob, uploadFileName);

    const formData = new FormData();
    // 일반 필드 추가
    console.log(dateTime);
    if (!dateTime) {
      setSnackbarMessage("날짜를 입력해주세요");
      handleSnackbarClick();
      return;
    }
    formData.append("dateTime", dateTime.$d.toString());
    formData.append("dateTimeSort", dateTimeSort);
    formData.append("alertAll", checked);
    formData.append("title", data.title);
    formData.append("category", category);
    formData.append("clubNumber", clubNumber);
    formData.append("where", data.where);
    formData.append("totalCount", data.totalCount);
    formData.append("cost", data.cost);
    // 이미지 파일이 있는 경우
    if (preview) {
      formData.append("img", file); // 이미지 파일 추가
    } else {
      setSnackbarMessage("대표사진을 등록해주세요");
      handleSnackbarClick();
      return;
    }

    try {
      const response = await axiosInstance.post("/meetings/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbarMessageMain("정모 생성을 완료했습니다.");
      handleSnackbarClickMain();
      secondModalClose();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("정모 생성에 실패했습니다..");
      handleSnackbarClick();
    }
  };

  ////////////////////////////////////////////////////////////////
  const cropButtonClick = () => {
    setCropModalOpen(true); // 크롭 모달 열기
  };
  //파일이 체인지 되었을 때
  const [uploadFileName, setUploadFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFileName(file.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  //파일이 체인지 되었을 때.end

  //파일이 드래그앤 드롭 되었을 때
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  //파일이 드래그앤 드롭 되었을 때.end
  const handleCropComplete = (croppedImage) => {
    setPreview(croppedImage); // 크롭된 이미지 미리보기 설정
    setValue("img", croppedImage); // react-hook-form에 파일 설정
    setCropModalOpen(false); // 크롭 모달 닫기
  };
  // 사진 파일 관련 코드
  const [preview, setPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  //블롭url을 블롭형태로 변환
  async function blobUrlToBlob(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  }

  //블롭형태를 파일형태로 변환
  function blobToFile(blob, fileName) {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }

  return (
    <Box>
      <Modal component="form" onSubmit={handleSubmit(onSubmit)} open={secondModal} onClose={secondModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: 450,
            width: 700,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <input id="img" type="file" accept="image/png, image/gif, image/jpeg" onChange={handleFileChange} style={{ display: "none" }} />
              <label htmlFor="img">
                <Button variant="outlined" component="span" sx={{ width: "100%" }}>
                  정모 대표사진 선택하기
                </Button>
              </label>
              {!preview && (
                <Box
                  mt={2}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  sx={{
                    width: "280px",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed gray",
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    이미지 미리보기가 없습니다. 이미지를 업로드하세요.
                  </Typography>
                </Box>
              )}
              {preview && (
                <Box mt={2} sx={{ width: "280px", height: "200px", position: "relative" }}>
                  <img src={preview} alt="미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <CropIcon
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      padding: "4px",
                      cursor: "pointer",
                    }}
                    onClick={cropButtonClick}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={7} container spacing={1}>
              <Grid item xs={12}>
                <TextField id="title" label="정모 제목" sx={{ width: "100%" }} {...register("title", { required: " 필수입력 요소." })} />
              </Grid>
              <Grid item xs={12} sx={{ marginBottom: "5px" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateTimePicker"]}>
                    <DateTimePicker
                      id="dateTime"
                      label="만나는 날짜 및 시간"
                      onChange={(date) => {
                        setDateTimeSort(date.toISOString());
                        setDateTime(date);
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField id="cost" label="비용" multiline sx={{ width: "100%" }} {...register("cost", { required: " 필수입력 요소." })} />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField id="where" label="위치" multiline placeholder="모임 장소를 입력하세요" sx={{ width: "100%", mb: 2 }} {...register("where", { required: " 필수입력 요소." })} />
            </Grid>
            <Grid container spacing={1} sx={{ marginLeft: "6px" }}>
              <Grid
                item
                xs={4}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TextField id="totalCount" label="인원 수" placeholder="숫자만 입력하세요" multiline sx={{ width: "100%", mb: 2 }} {...register("totalCount", { required: " 필수입력 요소." })} />
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: "20px", paddingTop: "15px" }}>
                    정모 공지 <span style={{ color: "gray" }}>(전체 멤버 알림)</span>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2} sx={{ marginLeft: "0px" }}>
                <Checkbox sx={{ "& .MuiSvgIcon-root": { fontSize: 40 } }} onChange={checkedChange} />
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <CustomButton type="submit" variant="contained" sx={{ backgroundColor: "#DBC7B5", width: "100%" }}>
                등록하기
              </CustomButton>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      {cropModalOpen && <MeetingImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}
      {/* 스낵바 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000} // 사라지는 시간
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <StyledSnackbarContent message={snackbarMessage} />
      </Snackbar>
      {/* 스낵바.end */}
    </Box>
  );
};

export default MeetingCreate2;
