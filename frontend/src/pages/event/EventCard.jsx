import React, { useEffect, useState, useRef } from "react";
import { FiMoreVertical } from "react-icons/fi";
import EventImageCropper from "./EventImageCropper";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../utils/axios";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const EventCard = ({ eventData, onClose }) => {
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [mainImageFile, setMainImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);

  const [endTime, setEndTime] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarDuration, setSnackbarDuration] = useState(6000);

  const writer = useSelector((state) => state.user?.userData?.user?.email);

  const extractFirstImageSrc = (htmlContent) => {
    const imgTag = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return imgTag ? imgTag[1] : "";
  };

  const extractTextContent = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || "");
      setCardTitle(eventData.cardTitle || "");
      const initialImage = extractFirstImageSrc(eventData.content || "") || eventData.cardImage || "";
      setDisplayImage(initialImage);
      setContentText(extractTextContent(eventData.content || ""));
      setEndTime(eventData.endTime ? dayjs(eventData.endTime) : null);
    }
  }, [eventData]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const imageToBlob = async (imageSrc) => {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    return blob;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      setDisplayImage(base64Image);
      setShowCropper(true);
    }
  };

  const handleTitleClick = () => setEditTitle(true);
  const handleTitleSave = () => setEditTitle(false);

  const handleCropComplete = async (croppedImageUrl) => {
    setDisplayImage(croppedImageUrl);
    try {
      const blob = await imageToBlob(croppedImageUrl);
      setMainImageFile(blob);
    } catch (error) {
      setSnackbarMessage("이미지를 처리하는 중 오류가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    }
    setShowCropper(false);
  };

  const uploadImageToServer = async (imageBlob) => {
    if (imageBlob) {
      const formData = new FormData();
      formData.append("file", imageBlob, "uploaded_image.png");
      try {
        const response = await axiosInstance.post("http://localhost:4000/events/upload", formData);
        const uploadedFileName = response.data.filename;
        const dateFolder = dayjs().format("YYYY-MM-DD");
        const imgLink = "http://localhost:4000/upload";
        const uploadedImageUrl = `${imgLink}/${dateFolder}/${uploadedFileName}`;
        setUploadedImageUrl(uploadedImageUrl);
        return uploadedImageUrl;
      } catch (error) {
        setSnackbarMessage("이미지 업로드에 실패했습니다.");
        setSnackbarSeverity("error");
        setSnackbarDuration(6000);
        setSnackbarOpen(true);
        throw error;
      }
    } else {
      setSnackbarMessage("업로드할 이미지가 없습니다.");
      setSnackbarSeverity("error");
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
      throw new Error("No image to upload");
    }
  };

  const mutationRegister = useMutation({
    mutationFn: async (dataToSend) => {
      const response = await axiosInstance.post("http://localhost:4000/events/newEvent", dataToSend);
      return response.data;
    },
    onSuccess: () => {
      setSnackbarMessage("이벤트가 성공적으로 등록되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarDuration(1000);
      setSnackbarOpen(true);
    },
    onError: () => {
      setSnackbarMessage("이벤트 등록에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: async (dataToSend) => {
      const response = await axiosInstance.put(`http://localhost:4000/events/${dataToSend.eventId}`, dataToSend);
      return response.data;
    },
    onSuccess: () => {
      setSnackbarMessage("이벤트가 성공적으로 수정되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarDuration(1000);
      setSnackbarOpen(true);
    },
    onError: () => {
      setSnackbarMessage("이벤트 수정에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    },
  });

  const handleSubmit = async () => {
    try {
      let finalCardImage = "";
      if (mainImageFile) {
        finalCardImage = await uploadImageToServer(mainImageFile);
      } else if (displayImage) {
        const blob = await imageToBlob(displayImage);
        finalCardImage = await uploadImageToServer(blob);
      } else if (eventData && eventData.cardImage) {
        finalCardImage = eventData.cardImage;
      }

      console.log("eventData:", eventData);
      console.log("eventId:", eventData?.eventId);

      const dataToSend = {
        eventId: eventData?.eventId || null,
        title,
        content: eventData.content,
        cardImage: finalCardImage,
        cardTitle,
        writer,
        endTime: endTime ? endTime.toISOString() : null,
        isEdit: eventData?.isEdit || false,
      };

      if (dataToSend.isEdit) {
        mutationUpdate.mutate(dataToSend);
      } else {
        mutationRegister.mutate(dataToSend);
      }
    } catch (error) {
      setSnackbarMessage("제출 중 오류가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    if (snackbarSeverity === "success") {
      onClose();
    }
  };

  return (
      <div className="flex flex-col items-center max-w-full m-[10px]">
        <h2 className="text-lg font-semibold mb-3">리스트 카드 모델링</h2>

        <div className="flex justify-center w-full">
          {/* 카드 */}
          <div className="w-full max-w-[350px] h-auto rounded-xl overflow-hidden shadow">
            {/* 이미지 */}
            <img
              src={displayImage || "https://via.placeholder.com/345x140?text=No+Image"}
              alt={title || "이미지 없음"}
              className="w-full h-[200px] object-cover cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            />

            {/* 카드 제목 */}
            <div className="flex justify-between items-center px-[10px] m-[10px]">
              <div className="flex-1 p-0">
                {editTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      placeholder="새로운 제목"
                      className="input-base text-sm flex-1"
                    />
                    <button
                      onClick={() => setEditTitle(false)}
                      className="btn-primary text-xs px-2 py-1"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <p
                    className="text-sm text-black line-clamp-2 cursor-pointer"
                    onClick={() => setEditTitle(true)}
                  >
                    {cardTitle || title || "기본 타이틀"}
                  </p>
                )}
              </div>
              <FiMoreVertical size={28} className="cursor-pointer ml-2" />
            </div>

            {/* 메타 정보 */}
            <div className="px-5">
              <p className="text-[10px]">조회수 : 100</p>
              <p className="text-[10px]">등록날짜 : {dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
              <p className="text-[10px]">
                종료날짜 : {endTime ? endTime.format("YYYY-MM-DD HH:mm:ss") : "선택되지 않음"}
              </p>
            </div>

            {/* 액션 */}
            <div className="flex gap-1 p-2">
              <button className="text-sm text-[#30231C] px-2 py-1">공유</button>
              <button className="text-sm text-[#30231C] px-2 py-1">더 보기</button>
            </div>
          </div>
        </div>

        {/* 종료시일 설정 + 제출 */}
        <div className="flex items-center justify-end mt-4 w-[350px] gap-2">
          {isDatePickerOpen && (
            <input
              type="datetime-local"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-[180px] focus:outline-none focus:ring-2 focus:ring-[#A67153]"
              value={endTime ? endTime.format("YYYY-MM-DDTHH:mm") : ""}
              onChange={(e) => {
                setEndTime(e.target.value ? dayjs(e.target.value) : null);
                setIsDatePickerOpen(false);
              }}
            />
          )}
          <button
            onClick={() => setIsDatePickerOpen(true)}
            className="bg-primary-100 hover:bg-primary-200 text-primary-800 text-sm px-3 py-2 rounded transition-colors"
          >
            종료시일 설정
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded transition-colors"
          >
            제출
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        {showCropper && (
          <EventImageCropper
            src={displayImage}
            onCropComplete={setDisplayImage}
            onClose={() => setShowCropper(false)}
          />
        )}

        {/* 스낵바 */}
        {snackbarOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000]">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg min-w-[280px] text-white ${
                snackbarSeverity === "success" ? "bg-green-600" : snackbarSeverity === "error" ? "bg-red-600" : "bg-yellow-600"
              }`}
            >
              <span className="flex-1 text-sm">{snackbarMessage}</span>
              <button
                onClick={() => handleSnackbarClose()}
                className="hover:text-gray-200 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default EventCard;
