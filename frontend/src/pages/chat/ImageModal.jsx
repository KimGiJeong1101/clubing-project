import React from "react";
import { FiX } from "react-icons/fi";

const ImageModal = ({ open, onClose, imageUrl }) => {
  // 모달 열림 상태 로그
  React.useEffect(() => {
    console.log("모달 열림 상태:", open);
  }, [open]);

  // 모달을 닫을 때 로그
  const handleClose = () => {
    console.log("모달 닫기 클릭");
    onClose();
  };

  // 배경 클릭 시 로그
  const handleBackdropClick = () => {
    console.log("모달 배경 클릭");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center" onClick={handleBackdropClick}>
      <div className="relative max-w-[90vw] max-h-[90vh] bg-transparent" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Full size" className="w-full h-auto object-contain" style={{ maxHeight: "80vh", border: "none", outline: "none" }} />
        <button onClick={handleClose} className="absolute top-2 right-2 z-10 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors" aria-label="닫기">
          <FiX size={24} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
