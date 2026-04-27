import React, { useState, useRef } from "react";
import { FiMoreVertical, FiEye, FiClock } from "react-icons/fi";
import { useSelector } from "react-redux";
import axiosInstance from "./../../utils/axios";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const EventListCard = ({ event, onEdit, onDelete, onImageClick }) => {
  const displayImage = event.cardImage || "https://via.placeholder.com/400x200?text=No+Image";
  const cardTitle = event.cardTitle || event.title || "기본 타이틀";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userEmail = useSelector((state) => state?.user?.userData?.user?.email);
  const isAdmin = useSelector((state) => state?.user?.userData?.user?.roles === 0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const isEnded = event.endTime && new Date(event.endTime) <= new Date();

  const handleEdit = () => {
    setMenuOpen(false);
    if (onEdit) onEdit(event);
  };

  const increaseViews = async (eventId) => {
    try {
      await axios.patch(`http://localhost:4000/events/${eventId}/views`);
    } catch (error) {
      console.error("조회수 증가 오류:", error);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`http://localhost:4000/events/${event._id}`, {
        data: { email: userEmail },
      });
      return response.data;
    },
    onSuccess: () => {
      setSnackbarMessage("이벤트가 삭제되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      if (onDelete) onDelete(event._id);
    },
    onError: () => {
      setSnackbarMessage("이벤트 삭제에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleDelete = () => {
    setMenuOpen(false);
    mutation.mutate();
  };

  const handleImageClick = () => {
    increaseViews(event._id);
    if (onImageClick) onImageClick();
  };

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }) : null);

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
        {/* 이미지 */}
        <div className="relative h-52 overflow-hidden cursor-pointer" onClick={handleImageClick}>
          <img src={displayImage} alt={event.title || "이미지 없음"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {/* 종료 오버레이 */}
          {isEnded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white/90 text-gray-700 text-sm font-nanum-bold px-4 py-1.5 rounded-full">종료된 이벤트</span>
            </div>
          )}
          {/* 종료 배지 */}
          {!isEnded && <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-nanum-bold px-2.5 py-0.5 rounded-full shadow-sm">진행 중</span>}
        </div>

        {/* 제목 + 메뉴 */}
        <div className="flex items-start justify-between px-4 pt-3.5 pb-1">
          <p className="text-sm font-nanum-bold text-gray-900 line-clamp-2 flex-1 leading-relaxed cursor-pointer hover:text-primary-600 transition-colors" onClick={handleImageClick}>
            {cardTitle}
          </p>
          {isAdmin && (
            <div className="relative ml-2 flex-shrink-0">
              <button onClick={() => setMenuOpen((o) => !o)} className="p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="메뉴">
                <FiMoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div ref={menuRef} className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[110px] py-1 overflow-hidden">
                    <button onClick={handleEdit} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      수정하기
                    </button>
                    <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      삭제하기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="px-4 pb-4 pt-1 space-y-1 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiEye className="w-3 h-3" />
            <span>조회수 {event.views || 0}</span>
          </div>
          {event.endTime && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FiClock className="w-3 h-3" />
              <span>
                {isEnded ? "종료: " : "마감: "}
                {formatDate(event.endTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 스낵바 */}
      {snackbarOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000]">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg min-w-[280px] text-white text-sm
            ${snackbarSeverity === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            <span className="flex-1">{snackbarMessage}</span>
            <button onClick={() => setSnackbarOpen(false)} className="font-bold text-lg leading-none">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventListCard;
