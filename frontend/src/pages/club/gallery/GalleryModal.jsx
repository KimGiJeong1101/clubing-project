import React from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiUser, FiCalendar } from "react-icons/fi";
import ImageCarousel from "../../../components/common/ImageCarousel";
import Reply from "./Reply";

const GalleryModal = ({ open, handleClose, images, writer, title, content, createdAt, updatedAt, handlePrev, handleNext, postId }) => {
  const postType = "Gallery";

  if (!open) return null;

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* 이전 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-3 sm:left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        <FiChevronLeft size={22} />
      </button>

      {/* 모달 박스 */}
      <div className="relative z-10 flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[900px] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button onClick={handleClose} className="absolute top-3 right-3 z-20 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
          <FiX size={18} />
        </button>

        {/* 이미지 캐러셀 영역 */}
        <div className="w-full md:w-[60%] bg-gray-900 flex items-center justify-center min-h-[240px] md:min-h-0 overflow-hidden">
          <ImageCarousel images={images} />
        </div>

        {/* 정보 + 댓글 영역 */}
        <div className="w-full md:w-[40%] flex flex-col overflow-y-auto max-h-[85vh]">
          {/* 헤더 정보 */}
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-nanum-bold text-gray-900 mb-3 pr-6">{title}</h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiUser size={12} className="flex-shrink-0 text-gray-400" />
                <span className="truncate">{writer}</span>
              </div>
              {formattedDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiCalendar size={12} className="flex-shrink-0 text-gray-400" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
            {content && <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>}
          </div>

          {/* 댓글 영역 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <Reply postType={postType} postId={postId} />
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-3 sm:right-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        <FiChevronRight size={22} />
      </button>
    </div>
  );
};

export default GalleryModal;
