import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageCarousel from "../../../components/common/ImageCarousel";
import Reply from "./Reply";

const GalleryModal = ({ open, handleClose, images, writer, title, content, createdAt, updatedAt, handlePrev, handleNext, postId }) => {
  const postType = "Gallery"; // GalleryModal이기 때문에 postType은 'Gallery'로 설정

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* 이전 버튼 */}
      <button
        onClick={handlePrev}
        className="absolute z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        style={{ left: "calc(10% - 130px)" }}
      >
        <FiChevronLeft size={24} />
      </button>

      {/* 모달 박스 */}
      <div
        className="relative z-10 flex items-center gap-4 bg-white rounded-lg shadow-2xl p-4 outline-none"
        style={{ width: "80%", height: "500px", maxWidth: "100%" }}
      >
        {/* 이미지 캐러셀 영역 */}
        <div className="w-[65%] h-full flex items-center justify-center text-center overflow-hidden">
          <ImageCarousel images={images} />
        </div>

        {/* 정보 + 댓글 영역 */}
        <div className="w-[35%] h-full p-1 flex flex-col justify-center gap-4">
          {/* Writer */}
          <div className="flex flex-col border border-gray-300 rounded px-2 py-1 relative">
            <span className="absolute -top-2.5 left-2 bg-white px-1 text-[0.6rem] text-gray-500">
              Writer
            </span>
            <span className="text-[0.7rem]">{writer}</span>
          </div>

          {/* Title */}
          <div className="flex flex-col border border-gray-300 rounded px-2 py-1 relative">
            <span className="absolute -top-2.5 left-2 bg-white px-1 text-[0.6rem] text-gray-500">
              Title
            </span>
            <span className="text-[0.7rem]">{title}</span>
          </div>

          {/* Content */}
          <div className="flex flex-col border border-gray-300 rounded px-2 py-1 relative">
            <span className="absolute -top-2.5 left-2 bg-white px-1 text-[0.6rem] text-gray-500">
              Content
            </span>
            <span className="text-[0.7rem]">{content}</span>
          </div>

          {/* 댓글 컴포넌트 */}
          <Reply postType={postType} postId={postId} />
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        className="absolute z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        style={{ right: "calc(10% - 130px)" }}
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  );
};

export default GalleryModal;
