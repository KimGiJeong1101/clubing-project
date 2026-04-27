import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HomeSearchClub from "./HomeSearchClub";
import CategoryModal from "../meeting/CategoryModal";
import CategoryModalSub from "../meeting/CategoryModalSub";
import axiosInstance from "../../../utils/axios";
import ImageCropper from "../ImageCropper";

const MainUpdate = () => {
  // 큰 카테고리
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpenModal = () => setOpenCategoryModal(true);
  const handleCloseModal = () => setOpenCategoryModal(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleCloseModal();
    handleOpenSubModal();
  };

  // 작은 카테고리
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const handleOpenSubModal = () => setOpenSubCategoryModal(true);
  const handleCloseSubModal = () => setOpenSubCategoryModal(false);

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    handleCloseSubModal();
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  const [homeLocation, setHomeLocation] = useState({});
  const [noUpdatePreview, setNoUpdatePreview] = useState("");

  const getReadClub = async () => {
    const response = await fetch(`http://localhost:4000/clubs/read/${clubNumber}`);
    const data = await response.json();
    setNoUpdatePreview(data.img);
    setValue("img", data.img);
    setHomeLocation({
      sido: data.region.city,
      sigoon: data.region.district,
      dong: data.region.neighborhood,
    });
    setSelectedCategory(data.mainCategory);
    setSelectedSubCategory(data.subCategory);
    return data;
  };

  const {
    data: readClub,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["readClub"],
    queryFn: getReadClub,
  });

  async function blobUrlToBlob(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  }

  function blobToFile(blob, fileName) {
    return new File([blob], fileName, { type: blob.type });
  }

  const [preview, setPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFileName(file.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setCropModalOpen(true);
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
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setPreview(croppedImage);
    setValue("img", croppedImage);
    setCropModalOpen(false);
  };

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ defaultValues: readClub, mode: "onChange" });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("mainCategory", data.mainCategory);
    formData.append("subCategory", data.subCategory);
    formData.append("title", data.title);
    formData.append("subTitle", data.subTitle);
    formData.append("content", data.content);
    formData.append("maxMember", data.maxMember);
    formData.append("region.city", homeLocation.sido);
    formData.append("region.district", homeLocation.sigoon);
    formData.append("region.neighborhood", homeLocation.dong);

    if (preview) {
      const blob = await blobUrlToBlob(preview);
      const file = blobToFile(blob, uploadFileName);
      formData.append("img", file);
      try {
        await axiosInstance.post(`/clubs/update/${clubNumber}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigate(`/clubs/main?clubNumber=${clubNumber}`, {
          state: { snackbarMessage: "모임 수정을 완료했습니다." },
        });
      } catch (err) {
        console.error(err);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, {
          state: { snackbarMessage: "모임 수정을 실패했습니다." },
        });
      }
    } else {
      try {
        await axiosInstance.post(`/clubs/update2/${clubNumber}`, data);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, {
          state: { snackbarMessage: "모임 수정을 완료했습니다." },
        });
      } catch (err) {
        console.error(err);
        navigate(`/clubs/main?clubNumber=${clubNumber}`, {
          state: { snackbarMessage: "모임 수정을 실패했습니다." },
        });
      }
    }
  };

  useEffect(() => {
    if (homeLocation.sido) setValue("region.city", homeLocation.sido);
    if (homeLocation.sigoon) setValue("region.district", homeLocation.sigoon);
    if (homeLocation.dong) setValue("region.neighborhood", homeLocation.dong);
  }, [homeLocation, setValue]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-3xl mb-2">⚠️</p>
        <p className="text-sm">데이터를 불러오는 데 실패했습니다.</p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-screen-md mx-auto mt-5 px-4 pb-10">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <p className="text-xs font-nanum-bold text-primary-500 uppercase tracking-widest mb-1">CLUBING</p>
          <h1 className="text-xl font-nanum-bold text-gray-900">모임 수정</h1>
        </div>

        <div className="grid grid-cols-1 gap-y-4">
          {/* 지역 */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
            <label className="font-semibold">지역</label>
            <div>
              <HomeSearchClub initialSido={homeLocation.sido} initialSigoon={homeLocation.sigoon} initialDong={homeLocation.dong} setSelectedSido={(sido) => setHomeLocation((prev) => ({ ...prev, sido }))} setSelectedSigoon={(sigoon) => setHomeLocation((prev) => ({ ...prev, sigoon }))} setSelectedDong={(dong) => setHomeLocation((prev) => ({ ...prev, dong }))} />
            </div>
          </div>

          {/* 큰 관심사 */}
          <div className="grid grid-cols-[90px_1fr] items-center gap-x-4">
            <label className="text-sm font-nanum-bold text-gray-500">큰 관심사</label>
            <input id="mainCategory" placeholder="클릭하여 관심사 선택" className="input-base w-full cursor-pointer" onClick={handleOpenModal} value={selectedCategory} readOnly {...register("mainCategory", { required: "필수입력 요소." })} />
          </div>

          {/* 상세 관심사 */}
          <div className="grid grid-cols-[90px_1fr] items-center gap-x-4">
            <label className="text-sm font-nanum-bold text-gray-500">상세 관심사</label>
            <input id="subCategory" placeholder="클릭하여 상세 관심사 선택" className="input-base w-full cursor-pointer" onClick={handleOpenModal} value={selectedSubCategory} readOnly {...register("subCategory", { required: "필수입력 요소." })} />
          </div>

          {/* 대표 사진 */}
          <div>
            <input id="img" type="file" accept="image/png, image/gif, image/jpeg" onChange={handleFileChange} className="hidden" />
            <label htmlFor="img" className="block w-full border border-gray-300 rounded text-center py-2 cursor-pointer hover:bg-gray-50 transition-colors mb-2">
              여기를 클릭해 모임 대표사진을 변경해보세요
            </label>

            {!preview && (
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="w-full h-[478.5px] flex items-center justify-center mt-2">
                <img src={`http://localhost:4000/` + noUpdatePreview} alt="미리보기" className="w-full h-full object-cover" />
              </div>
            )}
            {preview && (
              <div className="w-full h-[478.5px] mt-2">
                <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* 모임 이름 */}
          <input id="title" placeholder="모임 이름" className="input-base w-full" {...register("title", { required: "필수입력 요소." })} />

          {/* 서브 타이틀 */}
          <input id="subTitle" placeholder="서브 타이틀 (예: 카페, 친구, 운동)" className="input-base w-full" {...register("subTitle", { required: "필수입력 요소." })} />

          {/* 내용 */}
          <textarea id="content" placeholder="모임 소개를 작성해 주세요" rows={8} className="input-base w-full resize-none" {...register("content", { required: "필수입력 요소." })} />

          {/* 정원 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-nanum-bold text-gray-500 whitespace-nowrap">정원 (10~300명)</label>
            <input id="maxMember" type="number" min={10} max={300} placeholder="숫자만 입력" className="input-base w-[140px]" {...register("maxMember", { required: "필수입력 요소." })} />
          </div>

          {/* 제출 */}
          <div className="mt-2">
            <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl transition-colors">
              모임 정보 수정하기
            </button>
          </div>
        </div>

        <CategoryModal open={openCategoryModal} onClose={handleCloseModal} onCategorySelect={handleCategorySelect} />
        <CategoryModalSub open={openSubCategoryModal} onClose={handleCloseSubModal} onSubCategorySelect={handleSubCategorySelect} mainCategory={selectedCategory} />
        {cropModalOpen && <ImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}
      </div>
    </form>
  );
};

export default MainUpdate;
