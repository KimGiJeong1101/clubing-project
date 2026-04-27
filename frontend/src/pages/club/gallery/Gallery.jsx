import React, { useState } from "react";
import { FiPlusSquare, FiCheckCircle, FiTrash2, FiTrash, FiEdit2, FiX, FiCheckSquare, FiSquare } from "react-icons/fi";
import AnimatedCard from "../../../components/commonEffect/AnimatedCard";
import GalleryModal from "./GalleryModal";
import GalleryCreate from "./GalleryCreate";
import AlertModal from "./AlertModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { registerImages, fetchImages, deleteImages, deleteAllImages, editImage } from "../../../api/ClubGalleryApi";

/* ── 인라인 Snackbar ── */
const Snackbar = ({ open, message, severity, onClose }) => {
  if (!open) return null;
  const colorMap = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${colorMap[severity] ?? "bg-gray-700"}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <FiX size={16} />
      </button>
    </div>
  );
};

/* ── 인라인 Backdrop ── */
const Backdrop = ({ open }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();

  const userEmail = useSelector((state) => state.user?.userData?.user?.email);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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

  const deleteMutation = useMutation({
    mutationFn: (imageIds) => deleteImages(clubNumber, { imageIds, writer: userEmail }),
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

  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllImages(clubNumber, { writer: userEmail }),
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

  const handlePrev = () => {
    if (selectedIndex > 0) {
      handleOpen(sortedImages[selectedIndex - 1]._id, selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < sortedImages.length - 1) {
      handleOpen(sortedImages[selectedIndex + 1]._id, selectedIndex + 1);
    }
  };

  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
  };

  const handleRegisterComplete = (formData) => {
    registerMutation.mutate(formData);
  };

  const handleEditOpen = () => {
    if (selectedImageIds.length !== 1) {
      setAlertOpen(true);
      return;
    }
    const selectedGallery = sortedImages.find((img) => img._id === selectedImageIds[0]);
    setEditGallery(selectedGallery);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditGallery(null);
  };

  const handleEditComplete = (formData) => {
    editMutation.mutate(formData);
  };

  const handleSelectModeToggle = () => {
    setSelectMode(!selectMode);
    if (!selectMode) {
      setSelectedImageIds([]);
    }
  };

  const handleSelectImage = (id) => {
    setSelectedImageIds((prevSelectedImageIds) => {
      if (prevSelectedImageIds.includes(id)) {
        return prevSelectedImageIds.filter((imageId) => imageId !== id);
      } else {
        return [...prevSelectedImageIds, id];
      }
    });
  };

  const handleDeleteSelectedImages = () => {
    deleteMutation.mutate(selectedImageIds);
  };

  const handleDeleteAllImages = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDeleteOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteAllMutation.mutate();
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          데이터 로드 에러: {error.message}
        </div>
      )}

      {/* 이미지 없을 때 */}
      {sortedImages.length === 0 ? (
        <div className="w-full text-center py-12 px-4">
          <img
            src="/NoImagesAvailable.webp"
            alt="No images available"
            className="w-full max-w-[600px] mx-auto"
          />
        </div>
      ) : (
        /* 이미지 그리드: 모바일 1열 → md 2열 → lg 3열 */
        <div className="w-full max-w-[1400px] mx-auto px-6 pt-5 pb-16" style={{ background: "#FAF8F5" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedImages.map((item, index) => (
              <div
                key={item._id}
                className="relative overflow-hidden cursor-pointer aspect-square"
                onClick={(event) => {
                  if (event.target.type !== "checkbox") {
                    handleOpen(item._id, index);
                  }
                }}
              >
                <AnimatedCard image={item.thumbnailImage} />

                {/* 선택 모드 체크박스 */}
                {selectMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectImage(item._id);
                    }}
                    className="absolute top-2 right-2 z-[1000] bg-white/80 backdrop-blur-sm rounded-full p-0.5 text-primary-600 hover:text-primary-800 transition-colors shadow-sm"
                  >
                    {selectedImageIds.includes(item._id) ? (
                      <FiCheckSquare size={22} />
                    ) : (
                      <FiSquare size={22} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GalleryModal */}
      <GalleryModal
        open={open}
        handleClose={handleClose}
        postId={selectedId}
        images={selectedImages}
        writer={selectedWriter}
        title={selectedTitle}
        content={selectedContent}
        createdAt={selectedCreatedAt}
        updatedAt={selectedUpdatedAt}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />

      {/* 우측 고정 액션 버튼 그룹 */}
      <div className="fixed top-[180px] right-4 z-[1000] flex flex-col gap-1.5">
        {/* 이미지 등록 버튼 */}
        <button
          onClick={handleRegisterOpen}
          className="bg-white rounded-xl p-2.5 shadow-md hover:shadow-lg transition-all group"
          title="이미지 등록"
        >
          <FiPlusSquare
            size={20}
            className="text-primary-400 group-hover:text-primary-600 transition-colors"
          />
        </button>

        {/* 선택 모드 토글 버튼 */}
        <button
          onClick={handleSelectModeToggle}
          className={`rounded-xl p-2.5 shadow-md hover:shadow-lg transition-all group ${
            selectMode ? "bg-primary-600" : "bg-white"
          }`}
          title="선택 모드"
        >
          <FiCheckCircle
            size={20}
            className={`transition-colors ${
              selectMode
                ? "text-white"
                : "text-primary-400 group-hover:text-primary-600"
            }`}
          />
        </button>

        {/* 선택 모드 활성 시 추가 버튼들 */}
        {selectMode && (
          <>
            <button
              onClick={handleDeleteSelectedImages}
              className="bg-white rounded-xl px-2.5 py-2 shadow-md hover:shadow-lg transition-all text-xs font-nanum-bold text-red-400 hover:text-red-600 flex items-center gap-1"
              title="선택 삭제"
            >
              <FiTrash2 size={13} />
              선택삭제
            </button>
            <button
              onClick={handleDeleteAllImages}
              className="bg-white rounded-xl px-2.5 py-2 shadow-md hover:shadow-lg transition-all text-xs font-nanum-bold text-red-400 hover:text-red-600 flex items-center gap-1"
              title="전체 삭제"
            >
              <FiTrash size={13} />
              전체삭제
            </button>
            <button
              onClick={handleEditOpen}
              className="bg-white rounded-xl px-2.5 py-2 shadow-md hover:shadow-lg transition-all text-xs font-nanum-bold text-primary-500 hover:text-primary-700 flex items-center gap-1"
              title="수정"
            >
              <FiEdit2 size={13} />
              수정
            </button>
          </>
        )}
      </div>

      {/* 이미지 등록 모달 */}
      {registerOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-nanum-bold text-gray-900">이미지 등록</h2>
              <button
                onClick={handleRegisterClose}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            {/* 모달 본문 */}
            <div className="flex-1 overflow-y-auto">
              <GalleryCreate onRegisterComplete={handleRegisterComplete} />
            </div>
          </div>
        </div>
      )}

      {/* 이미지 수정 모달 */}
      {editOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-nanum-bold text-gray-900">이미지 수정</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            {/* 모달 본문 */}
            <div className="flex-1 overflow-y-auto">
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
            </div>
          </div>
        </div>
      )}

      {/* 전체 삭제 확인 모달 */}
      <AlertModal
        open={confirmDeleteOpen}
        handleClose={handleConfirmDeleteClose}
        handleConfirm={handleConfirmDelete}
        title="전체 삭제"
        description="정말로 모든 이미지를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 선택 개수 오류 알림 모달 */}
      <AlertModal
        open={alertOpen}
        handleClose={handleAlertClose}
        handleConfirm={handleAlertClose}
        title="이미지 선택 오류"
        description="수정 하실 때는 하나의 이미지만 선택해주세요."
        confirmText="확인"
        cancelText=""
      />

      {/* 로딩 Backdrop */}
      <Backdrop open={isLoading || isFetching} />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />
    </div>
  );
};

export default Gallery;
