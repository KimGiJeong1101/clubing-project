import { Button } from "@mui/material";
import { width } from "@mui/system";
import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// 스타일 객체 정의
const modalStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.5)", // 반투명 배경
  display: "flex",
  justifyContent: "center",
  alignItems: "center", // 수직 중앙 정렬
  zIndex: 11000, // 다른 요소 위에 표시되도록
};

const modalContentStyles = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  width: "1200px", // 고정 너비
  height: "600px", // 고정 높이
  overflow: "hidden", // 넘치는 내용 숨기기
  position: "relative", // 버튼의 절대 위치 설정을 위한 상대 위치
};

const closeButtonStyles = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "white",
  color: "black",
  border: "black solid 1px",
  borderRadius: "10px",
  cursor: "pointer",
  width: "20px",
  height: "30px",
  zIndex: 11001, // 버튼이 다른 요소 위에 표시되도록
};

const cropButtonStyles = {
  position: "absolute",
  bottom: "10px",
  right: "10px",
  background: "white",
  color: "black",
  border: "black solid 1px",
  borderRadius: "10px",
  cursor: "pointer",
  zIndex: 11001, // 버튼이 다른 요소 위에 표시되도록
};

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
        onCropComplete(croppedImageUrl); // prop으로 전달된 onCropComplete 함수 호출
      }, "image/jpeg");
    } else {
      console.error("이미지 또는 크롭 상태가 유효하지 않음");
    }
  };

  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <Button onClick={onClose} variant="outlined" style={closeButtonStyles}>
          X
        </Button>
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleCropChange} // 크롭 완료 시 콜백
          style={{ width: "100%", height: "100%" }}
          locked
        >
          <img
            src={src}
            alt="Source"
            onLoad={onLoad}
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden", // 넘치는 내용 숨기기
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </ReactCrop>
        <Button onClick={handleCropComplete} style={cropButtonStyles}>
          완료
        </Button>
      </div>
    </div>
  );
};

export default MeetingImageCropper;
