import { Box, Button, Container, Grid, Snackbar, SnackbarContent, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import HomeSearchClub from "./main/HomeSearchClub";
import CategoryModal from "./meeting/CategoryModal";
import CategoryModalSub from "./meeting/CategoryModalSub";
import ImageCropper from "./ImageCropper.jsx"; // 크롭 컴포넌트 import
import CropIcon from "@mui/icons-material/Crop";
import MeetingCreate1 from "./meeting/MeetingCreate1.jsx";
import { styled } from "@mui/system";

const buttonStyles = {
  "& .MuiButton-outlined": {
    borderColor: "#A67153", // 기본 테두리 색상
    "&:hover": {
      borderColor: "#A67153", // 호버 시 테두리 색상
      backgroundColor: "transparent", // 호버 시 배경 색상 (필요에 따라 조정)
    },
    "&.Mui-focused": {
      borderColor: "#A6836F", // 포커스 시 테두리 색상
    },
  },
  "&.MuiButton-contained": {
    "&:hover": {
      backgroundColor: "#A67153", // 호버 시 배경 색상 (선택 사항)
      color: "white", // 호버 시 텍스트 색상 (선택 사항)
    },
  },
};

const textFieldStyles = {
  // 기본 상태에서의 색상은 따로 설정하지 않음
  "& .MuiOutlinedInput-root": {
    // 호버 시 테두리 색상 변경
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#A67153", // 호버 시 테두리 색상
    },
    // 포커스 시 테두리 색상 변경
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#A6836F", // 포커스 시 테두리 색상
    },
  },
  // 포커스 시 라벨 색상 변경
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#A6836F", // 포커스 시 라벨 색상
  },
  // 포커스 시 플레이스홀더 색상 변경
  "& .MuiInputBase-input::placeholder": {
    color: "#A6836F", // 포커스 시 플레이스홀더 색상
  },
};

const ClubCreate = () => {
  //////////스낵바....
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
  //////////스낵바....end

  // 큰 카테고리 관련 코드
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpenModal = () => {
    setOpenCategoryModal(true);
  };
  const handleCloseModal = () => setOpenCategoryModal(false);

  const handleCategorySelect = (category) => {
    console.log(`category`);
    console.log(category);
    console.log(`category`);
    setSelectedCategory(category);
    handleCloseModal();
    handleOpenSubModal();
  };

  // 작은 카테고리 설정 코드
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);

  const handleOpenSubModal = () => setOpenSubCategoryModal(true);
  const handleCloseSubModal = () => setOpenSubCategoryModal(false);

  const handleSubCategorySelect = (subCategory) => {
    console.log(subCategory);
    console.log(subCategory);
    setSelectedSubCategory(subCategory);
    handleCloseSubModal();
  };

  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      mainCategory: "",
      subCategory: "",
      maxMember: 10,
      title: "",
      subTitle: "",
      content: "",
    },
    mode: "onChange",
  });

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

  //블롭URL -> 블롭 -> 파일 이렇게 2단변형을 이루는 중

  // 사진 파일 관련 코드
  const [preview, setPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  const cropButtonClick = () => {
    setCropModalOpen(true); // 크롭 모달 열기
  };
  //파일이 체인지 되었을 때
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

  // 주소 선택 시 업데이트
  const [homeLocation, setHomeLocation] = useState({
    sido: "",
    sigoon: "",
    dong: "",
  });

  useEffect(() => {
    setValue("region.city", homeLocation.sido);
    setValue("region.district", homeLocation.sigoon);
    setValue("region.neighborhood", homeLocation.dong);
  }, [homeLocation, setValue]);

  const onSubmit = async (data) => {
    const blob = await blobUrlToBlob(preview);
    const file = blobToFile(blob, uploadFileName);

    const formData = new FormData();

    // 일반 필드 추가
    formData.append("mainCategory", data.mainCategory);
    formData.append("subCategory", selectedSubCategory);
    formData.append("title", data.title);
    formData.append("subTitle", data.subTitle);
    formData.append("content", data.content);
    formData.append("maxMember", data.maxMember);
    formData.append(`region.city`, homeLocation.sido);
    formData.append(`region.district`, homeLocation.sigoon);
    formData.append(`region.neighborhood`, homeLocation.dong);
    // 이미지 파일이 있는 경우
    if (preview) {
      formData.append("img", file); // 이미지 파일 추가
    } else if (!preview) {
      setSnackbarMessage("대표 사진을 등록해주세요");
      handleSnackbarClick();
      return;
    }

    try {
      const response = await axiosInstance.post("/clubs/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/clubList`, { state: { snackbarMessage: "모임생성 완료했습니다." } });
    } catch (err) {
      console.error(err);
      navigate(`/clubList`, { state: { snackbarMessage: "모임생성 실패했습니다." } });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Container maxWidth="lg" sx={{ paddingBottom: "20px", marginTop: "20px", marginBottom: "30px", boxShadow: 5, borderRadius: "20px", backgroundColor: "white" }}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "600",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          모임개설
        </Typography>
        <Grid container spacing={1} sx={{ alignItems: "center" }}>
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>지역</Typography>
          </Grid>
          <Grid item xs={9}>
            <HomeSearchClub setSelectedSido={(sido) => setHomeLocation((prev) => ({ ...prev, sido }))} setSelectedSigoon={(sigoon) => setHomeLocation((prev) => ({ ...prev, sigoon }))} setSelectedDong={(dong) => setHomeLocation((prev) => ({ ...prev, dong }))} />
          </Grid>
          {/* 나머지 폼 필드 */}
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>큰 관심사</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField id="mainCategory" label="ex ) 큰 관심사 : 운동,여행,사교 등등" placeholder="눌럿을 때 모달띄워서 큰관심 선택 후 작은관심선택 후 자동기입까지" sx={{ width: "100%", mb: 2, ...textFieldStyles }} onClick={handleOpenModal} value={selectedCategory} {...register("mainCategory", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>상세 관심사</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField id="subCategory" label="상세관심사 : 자전거/야구/서핑/웨이크보드/요트 등등(최대3개)" sx={{ width: "100%", mb: 2, ...textFieldStyles }} onClick={handleOpenModal} value={selectedSubCategory} />
          </Grid>
          {/* 파일 입력 및 미리보기 */}

          <Grid item xs={12}>
            <input id="img" type="file" accept="image/png, image/gif, image/jpeg" onChange={handleFileChange} style={{ display: "none" }} />
            <label htmlFor="img">
              <Button variant="contained" component="span" sx={{ width: "100%", color: "white", backgroundColor: "#A6836F", ...buttonStyles }}>
                여기를 클릭해 모임 대표사진을 설정해보세요
              </Button>
            </label>
            {!preview && (
              <Box
                mt={2}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                sx={{
                  width: "100%",
                  height: "478.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #A6836F",
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  이미지 미리보기가 없습니다. 이미지를 업로드하세요.
                </Typography>
              </Box>
            )}
            {preview && (
              <Box mt={2} sx={{ width: "100%", height: "478.5px", position: "relative" }}>
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
          {/* 파일 입력 및 미리보기.end */}
          <Grid item xs={12}>
            <TextField id="title" label="모임 이름" sx={{ width: "100%", mb: 2, ...textFieldStyles }} {...register("title", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={12}>
            <TextField id="subTitle" label="모임에 대한 간략한 설명을 넣어보세요" sx={{ width: "100%", mb: 2, ...textFieldStyles }} {...register("subTitle", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={12}>
            <TextField id="content" label="내용 입력" multiline rows={10} variant="outlined" sx={{ width: "100%", mb: 2, ...textFieldStyles }} {...register("content", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={2}>
            <Typography sx={{ fontWeight: "600", ...textFieldStyles }}>정원 (10~300명)</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField id="maxMember" label="숫자만 입력" inputProps={{ type: "number", min: 10, max: 300 }} sx={{ width: "100%", ...textFieldStyles }} {...register("maxMember", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <Button variant="contained" sx={{ width: "100%", color: "white", backgroundColor: "#A6836F", ...buttonStyles }} type="submit">
              모임 만들기
            </Button>
          </Grid>
        </Grid>
        {/* <CategoryModal open={openCategoryModal} onClose={handleCloseModal} onCategorySelect={handleCategorySelect} /> */}
        <MeetingCreate1 open={openCategoryModal} handleCloseModal={handleCloseModal} FadHandleClick={handleCategorySelect} />
        <CategoryModalSub open={openSubCategoryModal} onClose={handleCloseSubModal} onSubCategorySelect={handleSubCategorySelect} mainCategory={selectedCategory} />
        {cropModalOpen && <ImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000} // 사라지는 시간
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <StyledSnackbarContent message={snackbarMessage} />
      </Snackbar>
    </Box>
  );
};

export default ClubCreate;
