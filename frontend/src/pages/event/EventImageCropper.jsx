import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const EventImageCropper = ({ src, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({
    unit: "px",
    width: 400,
    height: 225,
    x: 0,
    y: 0,
    aspect: 16 / 9,
  });

  const [completedCrop, setCompletedCrop] = useState(null);
  const [image, setImage] = useState(null);
  const [modalSize, setModalSize] = useState({ width: "auto", height: "auto" });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("warning");

  const onLoad = (e) => {
    const img = e.target;
    setImage(img);
    setModalSize({
      width: img.naturalWidth > 600 ? "90%" : `${img.naturalWidth}px`,
      height: img.naturalHeight > 400 ? "auto" : `${img.naturalHeight}px`,
    });
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const handleCropComplete = (c) => {
    setCompletedCrop(c);
  };

  const handleConfirmCrop = () => {
    if (image && completedCrop && completedCrop.width && completedCrop.height) {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      canvas.toBlob((blob) => {
        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl);
        onClose();
      }, "image/jpeg");
    } else {
      setSnackbarMessage("영역을 움직여서 이미지를 설정해주세요");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[11000] bg-black/50 flex justify-center items-center">
      <div
        className="relative bg-white p-5 rounded-lg shadow-lg overflow-hidden"
        style={{ maxWidth: "90%", maxHeight: "90%", width: modalSize.width, height: modalSize.height }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-[10px] right-[10px] z-[11001] bg-white text-black border border-black rounded-[10px] w-5 h-[30px] cursor-pointer text-sm"
        >
          X
        </button>

        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleCropComplete}
          style={{ width: "100%", height: "100%" }}
        >
          <img
            src={src}
            alt="Source"
            onLoad={onLoad}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </ReactCrop>

        {/* 완료 버튼 */}
        <button
          onClick={handleConfirmCrop}
          className="absolute bottom-[10px] right-[10px] z-[11001] bg-white text-black border border-black rounded-[10px] px-3 py-1 cursor-pointer text-sm"
        >
          완료
        </button>

        {/* 스낵바 */}
        {snackbarOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[11002]">
            <div className="flex items-center gap-3 bg-yellow-500 text-white px-5 py-3 rounded-lg shadow-lg min-w-[280px]">
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
    </div>
  );
};

export default EventImageCropper;
