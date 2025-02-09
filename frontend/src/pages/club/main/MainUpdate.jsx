import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HomeSearchClub from "./HomeSearchClub";
import CategoryModal from "../meeting/CategoryModal";
import CategoryModalSub from "../meeting/CategoryModalSub";
import axiosInstance from "../../../utils/axios";
import ImageCropper from "../ImageCropper";

const MainUpdate = () => {
  //큰 카테고리관련 코드
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpenModal = () => setOpenCategoryModal(true);
  const handleCloseModal = () => setOpenCategoryModal(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category); // 선택된 카테고리 저장
    handleCloseModal(); // 모달 닫기
    handleOpenSubModal();
  };
  //큰 카테고리관련 코드.END

  //작은 카테고리설정 코드
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const handleOpenSubModal = () => setOpenSubCategoryModal(true);
  const handleCloseSubModal = () => setOpenSubCategoryModal(false);

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory); // 선택된 카테고리 저장
    handleCloseSubModal(); // 모달 닫기
  };

  //Clubmember=3 이란 거 가져오기 위해서!
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  //주소 수정시
  const [homeLocation, setHomeLocation] = useState({});

  const [noUpdatePreview, setNoUpdatePreview] = useState("");
  const getReadClub = async () => {
    const response = await fetch(`http://localhost:4000/clubs/read/${clubNumber}`);
    const data = await response.json();
    setNoUpdatePreview(data.img);
    setValue("img", data.img);
    setHomeLocation({
      sido: data.region.city,
      sigoon: data.region.district,
      dong: data.region.neighborhood,
    });
    setSelectedCategory(data.mainCategory);
    setSelectedSubCategory(data.subCategory);
    return data;
  };
  const {
    data: readClub,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["readClub"],
    queryFn: getReadClub,
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

  //파일이 체인지 되었을 때
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFileName(file.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setCropModalOpen(true); // 크롭 모달 열기
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
        setCropModalOpen(true); // 크롭 모달 열기
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

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ defaultValues: readClub, mode: "onChange" });

  const onSubmit = async (data) => {
    const formData = new FormData();

    // 일반 필드 추가
    formData.append("mainCategory", data.mainCategory);
    formData.append("subCategory", data.subCategory);
    formData.append("title", data.title);
    formData.append("subTitle", data.subTitle);
    formData.append("content", data.content);
    formData.append("maxMember", data.maxMember);
    formData.append(`region.city`, homeLocation.sido);
    formData.append(`region.district`, homeLocation.sigoon);
    formData.append(`region.neighborhood`, homeLocation.dong);

    // 이미지 파일이 있는 경우
    if (preview) {
      const blob = await blobUrlToBlob(preview);
      const file = blobToFile(blob, uploadFileName);
      formData.append("img", file); // 이미지 파일 추가
      try {
        const response = await axiosInstance.post(`/clubs/update/${clubNumber}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        navigate(`/clubs/main?clubNumber=${clubNumber}`, { state: { snackbarMessage: "모임 수정을 완료했습니다." } });
      } catch (err) {
        console.error(err);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, { state: { snackbarMessage: "모임 수정을 실패했습니다." } });
      }
    } else {
      try {
        const response = await axiosInstance.post(`/clubs/update2/${clubNumber}`, data);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, { state: { snackbarMessage: "모임 수정을 완료했습니다." } });

      } catch (err) {
        console.error(err);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, { state: { snackbarMessage: "모임 수정을 실패했습니다." } });

      }
    }
  };
  useEffect(() => {
    if (homeLocation.sido) {
      setValue("region.city", homeLocation.sido);
    }
    if (homeLocation.sigoon) {
      setValue("region.district", homeLocation.sigoon);
    }
    if (homeLocation.dong) {
      setValue("region.neighborhood", homeLocation.dong);
    }
  }, [homeLocation, setValue]);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "600",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        모임수정
      </Typography>
      <Container maxWidth="md" sx={{ marginTop: "20px" }}>
        <Grid container spacing={1} sx={{ alignItems: "center" }}>
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>지역</Typography>
          </Grid>
          <Grid item xs={9}>
            <HomeSearchClub initialSido={homeLocation.sido} initialSigoon={homeLocation.sigoon} initialDong={homeLocation.dong} setSelectedSido={(sido) => setHomeLocation((prev) => ({ ...prev, sido }))} setSelectedSigoon={(sigoon) => setHomeLocation((prev) => ({ ...prev, sigoon }))} setSelectedDong={(dong) => setHomeLocation((prev) => ({ ...prev, dong }))} />
          </Grid>
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>큰 관심사</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField id="mainCategory" label="ex ) 큰 관심사 : 운동,여행,사교 등등" placeholder="눌럿을 때 모달띄워서 큰관심 선택 후 작은관심선택 후 자동기입까지" sx={{ width: "100%", mb: 2 }} onClick={handleOpenModal} value={selectedCategory} {...register("mainCategory", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid item xs={3} sx={{ padding: "0px" }}>
            <Typography sx={{ fontWeight: "600", padding: "0px" }}>상세 관심사</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField id="subCategory" label="상세관심사 : 자전거/야구/서핑/웨이크보드/요트 등등(최대3개)" sx={{ width: "100%", mb: 2 }} onClick={handleOpenModal} value={selectedSubCategory} {...register("subCategory", { required: " 필수입력 요소." })} />
          </Grid>
          {/* 파일 입력 및 미리보기 */}

          <Grid item xs={12}>
            <input id="img" type="file" accept="image/png, image/gif, image/jpeg" onChange={handleFileChange} style={{ display: "none" }} />
            <label htmlFor="img">
              <Button variant="outlined" component="span" sx={{ width: "100%" }}>
                여기를 클릭해 모임 대표사진을 변경해보세요
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
                }}
              >
                <img src={`http://localhost:4000/` + noUpdatePreview} alt="미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            )}
            {preview && (
              <Box mt={2} sx={{ width: "100%", height: "478.5px" }}>
                <img src={preview} alt="미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            )}
          </Grid>
          {/* 파일 입력 및 미리보기.end */}
          <Grid xs={12}>
            <TextField id="title" label="모임 이름" sx={{ width: "100%", mb: 2 }} {...register("title", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid xs={12}>
            <TextField id="subTitle" label="서브 타이틀 ex)카페,친구,운동" sx={{ width: "100%", mb: 2 }} {...register("subTitle", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid xs={12}>
            <TextField
              id="content"
              label="내용 입력"
              multiline
              rows={10} // 텍스트 영역의 기본 행 수
              variant="outlined" // 텍스트 필드의 스타일 (outlined, filled, standard)
              sx={{ width: "100%", mb: 2 }} // 스타일 설정 (예: 너비, 마진)
              {...register("content", { required: " 필수입력 요소." })}
            />
          </Grid>
          <Grid xs={2}>
            <Typography sx={{ fontWeight: "600" }}>정원 (10~300명)</Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField id="maxMember" label="숫자만 입력" inputProps={{ type: "number", min: 10, max: 300 }} sx={{ width: "100%" }} {...register("maxMember", { required: " 필수입력 요소." })} />
          </Grid>
          <Grid xs={12} sx={{ marginTop: "20px" }}>
            <Button variant="outlined" sx={{ width: "100%" }} type="submit">
              모임 정보 수정하기
            </Button>
          </Grid>
        </Grid>
        <CategoryModal open={openCategoryModal} onClose={handleCloseModal} onCategorySelect={handleCategorySelect} />
        <CategoryModalSub open={openSubCategoryModal} onClose={handleCloseSubModal} onSubCategorySelect={handleSubCategorySelect} mainCategory={selectedCategory} />
        {cropModalOpen && <ImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}
      </Container>
    </Box>
  );
};

export default MainUpdate;
