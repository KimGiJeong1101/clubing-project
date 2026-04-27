import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageCropper = ({ src, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ unit: "px", width: 852, height: 478.5, aspect: 16 / 9 });
  const [image, setImage] = useState(null);

  const onLoad = (e) => setImage(e.target);

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
        onCropComplete(URL.createObjectURL(blob));
      }, "image/jpeg");
    } else {
      console.error("이미지 또는 크롭 상태가 유효하지 않음");
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] bg-black/50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-2xl p-5 w-[90vw] max-w-[1200px] h-[70vh] max-h-[600px] overflow-hidden">
        <button onClick={onClose} className="absolute top-2.5 right-2.5 z-[11001] bg-white border border-black text-black rounded-lg w-5 h-7 text-xs cursor-pointer hover:bg-gray-100 transition-colors">
          X
        </button>
        <ReactCrop crop={crop} onChange={setCrop} onComplete={setCrop} style={{ width: "100%", height: "100%" }} locked>
          <img src={src} alt="Source" onLoad={onLoad} style={{ width: "100%", height: "100%", objectFit: "contain", maxWidth: "100%", maxHeight: "100%", overflow: "hidden" }} />
        </ReactCrop>
        <button onClick={handleCropComplete} className="absolute bottom-2.5 right-2.5 z-[11001] bg-white border border-black text-black rounded-lg px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
          완료
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
