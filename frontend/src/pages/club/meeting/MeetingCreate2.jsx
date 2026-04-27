import React, { useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import axiosInstance from "./../../../utils/axios";
import CustomButton from "../../../components/club/CustomButton.jsx";
import { useNavigate } from "react-router-dom";
import MeetingImageCropper from "./MeetingImageCropper.jsx";
import { FiCrop } from "react-icons/fi";

dayjs.locale("ko");

const MeetingCreate2 = ({ clubNumber, secondModalClose, secondModal, category, setSnackbarMessageMain, handleSnackbarClickMain }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClick = () => {
    setOpenSnackbar(true);
    setTimeout(() => setOpenSnackbar(false), 1000);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const [dateTime, setDateTime] = useState(null);
  const [dateTimeSort, setDateTimeSort] = useState(null);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const checkedChange = (event) => {
    setChecked(event.target.checked);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    const blob = await blobUrlToBlob(preview);
    const file = blobToFile(blob, uploadFileName);

    const formData = new FormData();
    console.log(dateTime);
    if (!dateTime) {
      setSnackbarMessage("날짜를 입력해주세요");
      handleSnackbarClick();
      return;
    }
    formData.append("dateTime", dateTime.$d.toString());
    formData.append("dateTimeSort", dateTimeSort);
    formData.append("alertAll", checked);
    formData.append("title", data.title);
    formData.append("category", category);
    formData.append("clubNumber", clubNumber);
    formData.append("where", data.where);
    formData.append("totalCount", data.totalCount);
    formData.append("cost", data.cost);

    if (preview) {
      formData.append("img", file);
    } else {
      setSnackbarMessage("대표사진을 등록해주세요");
      handleSnackbarClick();
      return;
    }

    try {
      const response = await axiosInstance.post("/meetings/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbarMessageMain("정모 생성을 완료했습니다.");
      handleSnackbarClickMain();
      secondModalClose();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("정모 생성에 실패했습니다..");
      handleSnackbarClick();
    }
  };

  const cropButtonClick = () => {
    setCropModalOpen(true);
  };

  const [uploadFileName, setUploadFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFileName(file.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setPreview(croppedImage);
    setValue("img", croppedImage);
    setCropModalOpen(false);
  };

  const [preview, setPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  async function blobUrlToBlob(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  }

  function blobToFile(blob, fileName) {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }

  if (!secondModal) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={secondModalClose} />

      {/* 모달 */}
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black shadow-2xl p-8" style={{ width: 700, height: 450 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4">
            {/* 이미지 업로드 영역 */}
            <div className="w-[280px] flex-shrink-0">
              <input id="img" type="file" accept="image/png, image/gif, image/jpeg" onChange={handleFileChange} className="hidden" />
              <label htmlFor="img">
                <span className="block w-full border border-gray-400 rounded text-center py-1.5 cursor-pointer text-sm hover:bg-gray-50 transition-colors">정모 대표사진 선택하기</span>
              </label>

              {!preview && (
                <div className="mt-4 w-[280px] h-[200px] flex items-center justify-center border-2 border-dashed border-gray-400" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                  <p className="text-base text-gray-500 text-center px-2">이미지 미리보기가 없습니다. 이미지를 업로드하세요.</p>
                </div>
              )}

              {preview && (
                <div className="mt-4 relative w-[280px] h-[200px]">
                  <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
                  <button type="button" onClick={cropButtonClick} className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1 cursor-pointer hover:bg-black/70 transition-colors">
                    <FiCrop size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 입력 필드 영역 */}
            <div className="flex-grow flex flex-col gap-2">
              <div>
                <input id="title" type="text" placeholder="정모 제목" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400" {...register("title", { required: " 필수입력 요소." })} />
              </div>

              <div className="mb-1.5">
                <label className="block text-xs text-gray-500 mb-1">만나는 날짜 및 시간</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  onChange={(e) => {
                    const d = dayjs(e.target.value);
                    setDateTime(d);
                    setDateTimeSort(d.toISOString());
                  }}
                />
              </div>

              <div>
                <textarea id="cost" placeholder="비용" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" {...register("cost", { required: " 필수입력 요소." })} />
              </div>
            </div>
          </div>

          {/* 위치 */}
          <div className="mt-2 mb-4">
            <textarea id="where" placeholder="모임 장소를 입력하세요" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" {...register("where", { required: " 필수입력 요소." })} />
          </div>

          {/* 하단: 인원 수 + 공지 체크 + 등록 버튼 */}
          <div className="flex items-center gap-4">
            <div className="w-2/5">
              <textarea id="totalCount" placeholder="숫자만 입력하세요 (인원 수)" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" {...register("totalCount", { required: " 필수입력 요소." })} />
            </div>
            <div className="flex items-center gap-2 flex-grow justify-end">
              <span className="text-xl">
                정모 공지 <span className="text-gray-400">(전체 멤버 알림)</span>
              </span>
              <input type="checkbox" onChange={checkedChange} className="w-8 h-8 cursor-pointer accent-blue-600" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <CustomButton type="submit" variant="contained" sx={{ backgroundColor: "#DBC7B5", width: "100%" }}>
              등록하기
            </CustomButton>
          </div>
        </form>
      </div>

      {/* 크롭 모달 */}
      {cropModalOpen && <MeetingImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}

      {/* 스낵바 */}
      {openSnackbar && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="bg-white text-primary-600 rounded-2xl px-6 py-3 shadow-lg text-center min-w-[250px] border border-primary-100">{snackbarMessage}</div>
        </div>
      )}
    </>
  );
};

export default MeetingCreate2;
