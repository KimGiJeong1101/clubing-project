import React, { useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import AnimatedCard from "../../../components/commonEffect/AnimatedCard";
import GalleryModal from "./GalleryModal";
import { Button, Box, Checkbox, Snackbar, Alert } from "@mui/material";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import CheckCircleSharpIcon from "@mui/icons-material/CheckCircleSharp";
import GalleryCreate from "./GalleryCreate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import AlertModal from "./AlertModal";
import Modal from "@mui/material/Modal";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // 유저 정보 가져오기 위해 추가
import { registerImages, fetchImages, deleteImages, deleteAllImages, editImage } from "../../../api/ClubGalleryApi";

const Gallery = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedWriter, setSelectedWriter] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedCreatedAt, setSelectedCreatedAt] = useState("");
  const [selectedUpdatedAt, setSelectedUpdatedAt] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editGallery, setEditGallery] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar 상태 관리
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar 메시지 관리
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar 상태 관리
  const queryClient = useQueryClient();

  const userEmail = useSelector((state) => state.user?.userData?.user?.email); // 유저 이메일 가져오기

  // Snackbar 닫기 함수
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 이미지 데이터를 가져오는 useQuery 훅 (조회 로직)
  const {
    data: images = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["images", clubNumber],
    queryFn: () => fetchImages(clubNumber),
    enabled: !!clubNumber,
  });

  const sortedImages = images.slice().reverse();

  // 이미지 등록을 처리하는 useMutation 훅 (등록 로직)
  const registerMutation = useMutation({
    mutationFn: (newImages) => registerImages(clubNumber, newImages),
    onSuccess: () => {
      queryClient.invalidateQueries(["images", clubNumber]);
      setRegisterOpen(false);
      setSnackbarMessage("이미지가 성공적으로 등록되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setRegisterOpen(false);
      setSnackbarMessage(error.response?.data?.error || "등록 중 에러가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // 선택된 이미지를 삭제하는 useMutation 훅 (삭제 로직)
  const deleteMutation = useMutation({
    mutationFn: (imageIds) => deleteImages(clubNumber, { imageIds, writer: userEmail }), // writer 정보 추가
    onSuccess: () => {
      queryClient.invalidateQueries(["images", clubNumber]);
      setSelectedImageIds([]);
      setSelectMode(false);
      setSnackbarMessage("성공적으로 삭제되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage(error.response?.data?.error || "삭제 중 에러가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // 모든 이미지를 삭제하는 useMutation 훅 (전체 삭제 로직)
  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllImages(clubNumber, { writer: userEmail }), // writer 정보 추가
    onSuccess: () => {
      queryClient.invalidateQueries(["images", clubNumber]);
      setSelectMode(false);
      setConfirmDeleteOpen(false);
      setSnackbarMessage("모든 이미지가 성공적으로 삭제되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage(error.response?.data?.error || "전체 삭제 중 에러가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // 이미지를 수정하는 useMutation 훅 (수정 로직)
  const editMutation = useMutation({
    mutationFn: (formData) => editImage(clubNumber, { id: editGallery._id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries(["images", clubNumber]);
      setEditOpen(false);
      setSnackbarMessage("이미지가 성공적으로 수정되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage(error.response?.data?.error || "수정 중 에러가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  // 모달을 열고 이미지를 표시하는 핸들러
  const handleOpen = async (id, index) => {
    try {
      const response = await axios.get(`http://localhost:4000/clubs/gallery/${clubNumber}/images/${id}`);
      const gallery = response.data;

      setSelectedIndex(index);
      setSelectedId(gallery._id);
      setSelectedImages(gallery.originImages);
      setSelectedWriter(gallery.writer);
      setSelectedTitle(gallery.title);
      setSelectedContent(gallery.content);
      setSelectedCreatedAt(gallery.createdAt);
      setSelectedUpdatedAt(gallery.updatedAt);
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch gallery details", error);
    }
  };

  // 모달을 닫는 핸들러
  const handleClose = () => {
    setOpen(false);
    setSelectedImages([]);
    setSelectedId("");
    setSelectedWriter("");
    setSelectedTitle("");
    setSelectedContent("");
    setSelectedCreatedAt("");
    setSelectedUpdatedAt("");
  };

  // 이전 이미지로 이동하는 핸들러
  const handlePrev = () => {
    if (selectedIndex > 0) {
      handleOpen(sortedImages[selectedIndex - 1]._id, selectedIndex - 1);
    }
  };

  // 다음 이미지로 이동하는 핸들러
  const handleNext = () => {
    if (selectedIndex < sortedImages.length - 1) {
      handleOpen(sortedImages[selectedIndex + 1]._id, selectedIndex + 1);
    }
  };

  // 이미지 등록 모달을 여는 핸들러
  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };

  // 이미지 등록 모달을 닫는 핸들러
  const handleRegisterClose = () => {
    setRegisterOpen(false);
  };

  // 이미지 등록 완료 시 호출되는 핸들러
  const handleRegisterComplete = (formData) => {
    registerMutation.mutate(formData);
  };

  // 이미지 수정 모달을 여는 핸들러
  const handleEditOpen = () => {
    if (selectedImageIds.length !== 1) {
      setAlertOpen(true);
      return;
    }
    const selectedGallery = sortedImages.find((img) => img._id === selectedImageIds[0]);
    setEditGallery(selectedGallery);
    setEditOpen(true);
  };

  // 이미지 수정 모달을 닫는 핸들러
  const handleEditClose = () => {
    setEditOpen(false);
    setEditGallery(null);
  };

  // 이미지 수정 완료 시 호출되는 핸들러
  const handleEditComplete = (formData) => {
    editMutation.mutate(formData);
  };

  // 선택 모드를 토글하는 핸들러
  const handleSelectModeToggle = () => {
    setSelectMode(!selectMode);
    if (!selectMode) {
      setSelectedImageIds([]);
    }
  };

  // 이미지를 선택하는 핸들러
  const handleSelectImage = (id) => {
    setSelectedImageIds((prevSelectedImageIds) => {
      if (prevSelectedImageIds.includes(id)) {
        return prevSelectedImageIds.filter((imageId) => imageId !== id);
      } else {
        return [...prevSelectedImageIds, id];
      }
    });
  };

  // 선택된 이미지를 삭제하는 핸들러
  const handleDeleteSelectedImages = () => {
    deleteMutation.mutate(selectedImageIds);
  };

  // 모든 이미지를 삭제하는 핸들러
  const handleDeleteAllImages = () => {
    setConfirmDeleteOpen(true);
  };

  // 전체 삭제 확인 모달을 닫는 핸들러
  const handleConfirmDeleteClose = () => {
    setConfirmDeleteOpen(false);
  };

  // 모든 이미지 삭제를 확인하는 핸들러
  const handleConfirmDelete = () => {
    deleteAllMutation.mutate();
  };

  // 경고 모달을 닫는 핸들러
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ minWidth: "400px", overflowX: "hidden", position: "relative" }}>
      {error && <div>데이터 로드 에러: {error.message}</div>} {/* 에러가 있을 경우 에러 메시지 출력 */}
      {/* 이미지가 없을 때 기본 이미지 표시 */}
      {sortedImages.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            padding: "50px 0",
          }}
        >
          <img
            src="/NoImagesAvailable.webp"
            alt="No images available"
            style={{
              maxWidth: "600px",
              margin: "0 auto",
            }}
          />
        </Box>
      ) : (
        <ImageList
          sx={{
            width: "100%",
            maxWidth: "1400px",
            backgroundColor: "#F0F0F0",
            paddingTop: 5,
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 20,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            boxSizing: "border-box",
          }}
          cols={3}
        >
          {sortedImages.map((item, index) => (
            <ImageListItem
              key={item._id}
              sx={{
                margin: 0,
                padding: 0,
                position: "relative",
                overflow: "hidden",
                height: 0,
                paddingBottom: "100%",
              }}
              onClick={(event) => {
                if (event.target.type !== "checkbox") {
                  handleOpen(item._id, index);
                }
              }}
            >
              <AnimatedCard image={item.thumbnailImage} />
              {selectMode && (
                <Checkbox
                  checked={selectedImageIds.includes(item._id)}
                  onChange={() => handleSelectImage(item._id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1000,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "50%",
                  }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}
      <GalleryModal open={open} handleClose={handleClose} postId={selectedId} images={selectedImages} writer={selectedWriter} title={selectedTitle} content={selectedContent} createdAt={selectedCreatedAt} updatedAt={selectedUpdatedAt} handlePrev={handlePrev} handleNext={handleNext} />
      <Button
        sx={{
          position: "fixed",
          top: 200,
          right: 16,
          zIndex: 1000,
          backgroundColor: "white.main",
          color: "primary.main",
          "&:hover": {
            backgroundColor: "white.main",
          },
        }}
        onClick={handleRegisterOpen}
      >
        <AddToPhotosIcon
          sx={{
            color: "#DBC7B5",
            "&:hover": {
              color: "#A67153",
            },
          }}
        />
      </Button>
      <Button
        sx={{
          position: "fixed",
          top: 240,
          right: 16,
          zIndex: 1000,
          backgroundColor: "white.main",
          color: "primary.main",
          "&:hover": {
            backgroundColor: "white.main",
          },
        }}
        onClick={handleSelectModeToggle}
      >
        <CheckCircleSharpIcon
          sx={{
            color: "#DBC7B5",
            "&:hover": {
              color: "#A67153",
            },
          }}
        />
      </Button>
      {selectMode && (
        <>
          <Button
            sx={{
              position: "fixed",
              top: 270,
              right: 16,
              zIndex: 1000,
              backgroundColor: "white.main",
              color: "#DBC7B5",
              "&:hover": {
                color: "#A67153",
              },
            }}
            onClick={handleDeleteSelectedImages}
          >
            선택삭제
          </Button>
          <Button
            sx={{
              position: "fixed",
              top: 300,
              right: 16,
              zIndex: 1000,
              backgroundColor: "white.main",
              color: "#DBC7B5",
              "&:hover": {
                color: "#A67153",
              },
            }}
            onClick={handleDeleteAllImages}
          >
            전체삭제
          </Button>
          <Button
            sx={{
              position: "fixed",
              top: 330,
              right: 16,
              zIndex: 1000,
              backgroundColor: "white.main",
              color: "#DBC7B5",
              "&:hover": {
                color: "#A67153",
              },
            }}
            onClick={handleEditOpen}
          >
            수정
          </Button>
        </>
      )}
      <Modal open={registerOpen} onClose={handleRegisterClose} aria-labelledby="register-modal-title" aria-describedby="register-modal-description">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <GalleryCreate onRegisterComplete={handleRegisterComplete} />
        </Box>
      </Modal>
      <AlertModal open={confirmDeleteOpen} handleClose={handleConfirmDeleteClose} handleConfirm={handleConfirmDelete} title="전체 삭제" description="정말로 모든 이미지를 삭제하시겠습니까?" confirmText="삭제" cancelText="취소" />
      <AlertModal open={alertOpen} handleClose={handleAlertClose} handleConfirm={handleAlertClose} title="이미지 선택 오류" description="수정 하실 때는 하나의 이미지만 선택해주세요." confirmText="확인" cancelText="" />
      <Modal open={editOpen} onClose={handleEditClose} aria-labelledby="edit-modal-title" aria-describedby="edit-modal-description">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          {editGallery && (
            <GalleryCreate
              onRegisterComplete={handleEditComplete}
              initialData={{
                title: editGallery.title,
                content: editGallery.content,
                images: editGallery.allImages,
              }}
            />
          )}
        </Box>
      </Modal>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading || isFetching} // isLoading과 isFetching을 모두 확인
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Snackbar Component */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Gallery;
