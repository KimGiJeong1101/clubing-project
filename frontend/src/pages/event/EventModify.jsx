import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import CKEditor5Editor from "./EventBoardEditor";
import axiosInstance from "./../../utils/axios";
import { useSelector } from "react-redux";

const EventModify = ({ eventId, onClose, onNext }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const userEmail = useSelector((state) => state?.user?.userData?.user?.email);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:4000/events/${eventId}`);
        const { title, content, cardImage } = response.data;
        setTitle(title);
        setContent(content);
        setImage(cardImage || "");
      } catch (error) {
        setSnackbarMessage("이벤트 데이터를 불러오는 데 실패했습니다.");
        setOpenSnackbar(true);
      }
    };
    fetchEventData();
  }, [eventId]);

  const handleEditorChange = (data) => {
    setContent(data);
  };

  const handleNext = () => {
    const defaultImageUrl = "https://via.placeholder.com/400?text=No+Image";
    const finalImage = image || defaultImageUrl;

    if (title && content) {
      const eventDetails = {
        writer: userEmail,
        title,
        content,
        cardImage: finalImage,
        eventId,
        isEdit: true,
      };
      onNext(eventDetails);
    } else {
      setSnackbarMessage("제목과 내용을 입력해주세요.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="relative">
      <button aria-label="close" onClick={onClose} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 transition-colors">
        <FiX size={20} />
      </button>

      <h1 className="text-2xl font-bold mb-4">이벤트 수정</h1>

      <div className="flex-1 overflow-auto mt-[1px] pr-[10px]">
        <CKEditor5Editor title={title} setTitle={setTitle} content={content} onChange={handleEditorChange} setImage={setImage} />
      </div>

      <button onClick={handleNext} className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-nanum-bold transition-colors">
        다음
      </button>

      {/* 스낵바 */}
      {openSnackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="flex items-center gap-3 bg-yellow-500 text-white px-5 py-3 rounded-lg shadow-lg min-w-[280px]">
            <span className="flex-1 text-sm">{snackbarMessage}</span>
            <button onClick={handleCloseSnackbar} className="hover:text-gray-200 font-bold text-lg leading-none">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventModify;
