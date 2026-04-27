import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// 이미지 크롭퍼 컴포넌트
const MeetingImageCropper = ({ src, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({
    unit: "px",
    width: 280,
    height: 200,
    aspect: 7 / 5,
  });

  const [image, setImage] = useState(null);

  const onLoad = (e) => {
    setImage(e.target);
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const handleCropComplete = () => {
    if (image && crop.width && crop.height) {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => {
        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl);
      }, "image/jpeg");
    } else {
      console.error("이미지 또는 크롭 상태가 유효하지 않음");
    }
  };

  return (
    /* 배경 오버레이 */
    <div className="fixed inset-0 z-[11000] flex justify-center items-center bg-black/50">
      {/* 모달 콘텐츠 */}
      <div className="relative bg-white p-5 rounded-lg shadow-xl overflow-hidden" style={{ width: 1200, height: 600 }}>
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2.5 right-2.5 z-[11001] bg-white text-black border border-black rounded-lg w-5 h-[30px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
          X
        </button>

        {/* 크롭 영역 */}
        <ReactCrop crop={crop} onChange={handleCropChange} onComplete={handleCropChange} style={{ width: "100%", height: "100%" }} locked>
          <img src={src} alt="Source" onLoad={onLoad} className="w-full h-full object-contain max-w-full max-h-full overflow-hidden" />
        </ReactCrop>

        {/* 완료 버튼 */}
        <button onClick={handleCropComplete} className="absolute bottom-2.5 right-2.5 z-[11001] bg-white text-black border border-black rounded-lg px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors">
          완료
        </button>
      </div>
    </div>
  );
};

export default MeetingImageCropper;
