import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiCrop } from "react-icons/fi";
import axiosInstance from "../../utils/axios";
import HomeSearchClub from "./main/HomeSearchClub";
import CategoryModalSub from "./meeting/CategoryModalSub";
import ImageCropper from "./ImageCropper.jsx";
import MeetingCreate1 from "./meeting/MeetingCreate1.jsx";
import CustomSnackbarWithTimer from "../../components/auth/Snackbar";

const ClubCreate = () => {
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [homeLocation, setHomeLocation] = useState({ sido: "", sigoon: "", dong: "" });

  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: { mainCategory: "", subCategory: "", maxMember: 10, title: "", subTitle: "", content: "" },
    mode: "onChange",
  });

  useEffect(() => {
    setValue("region.city", homeLocation.sido);
    setValue("region.district", homeLocation.sigoon);
    setValue("region.neighborhood", homeLocation.dong);
  }, [homeLocation, setValue]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setOpenCategoryModal(false);
    setOpenSubCategoryModal(true);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setOpenSubCategoryModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage) => {
    setPreview(croppedImage);
    setValue("img", croppedImage);
    setCropModalOpen(false);
  };

  async function blobUrlToBlob(blobUrl) {
    const response = await fetch(blobUrl);
    return response.blob();
  }

  function blobToFile(blob, fileName) {
    return new File([blob], fileName, { type: blob.type });
  }

  const onSubmit = async (data) => {
    if (!preview) {
      setSnackbar({ open: true, msg: "대표 사진을 등록해주세요" });
      return;
    }

    const blob = await blobUrlToBlob(preview);
    const file = blobToFile(blob, uploadFileName);
    const formData = new FormData();
    formData.append("mainCategory", data.mainCategory);
    formData.append("subCategory", selectedSubCategory);
    formData.append("title", data.title);
    formData.append("subTitle", data.subTitle);
    formData.append("content", data.content);
    formData.append("maxMember", data.maxMember);
    formData.append("region.city", homeLocation.sido);
    formData.append("region.district", homeLocation.sigoon);
    formData.append("region.neighborhood", homeLocation.dong);
    formData.append("img", file);

    try {
      await axiosInstance.post("/clubs/create", formData, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/clubList", { state: { snackbarMessage: "모임생성 완료했습니다." } });
    } catch (err) {
      console.error(err);
      navigate("/clubList", { state: { snackbarMessage: "모임생성 실패했습니다." } });
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-[#A6836F] hover:border-[#A67153] transition-colors";
  const labelCls = "text-sm font-nanum-bold text-gray-700";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-xl font-nanum-bold text-gray-800 text-center">모임개설</h2>

        {/* 지역 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
          <label className={`${labelCls} pt-3`}>지역</label>
          <div className="col-span-3">
            <HomeSearchClub setSelectedSido={(v) => setHomeLocation((p) => ({ ...p, sido: v }))} setSelectedSigoon={(v) => setHomeLocation((p) => ({ ...p, sigoon: v }))} setSelectedDong={(v) => setHomeLocation((p) => ({ ...p, dong: v }))} />
          </div>
        </div>

        {/* 큰 관심사 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <label className={labelCls}>큰 관심사</label>
          <div className="col-span-3">
            <input readOnly onClick={() => setOpenCategoryModal(true)} value={selectedCategory} placeholder="클릭하여 큰 관심사 선택" className={`${inputCls} cursor-pointer bg-white`} {...register("mainCategory", { required: "필수입력 요소." })} />
          </div>
        </div>

        {/* 상세 관심사 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <label className={labelCls}>상세 관심사</label>
          <div className="col-span-3">
            <input readOnly onClick={() => setOpenCategoryModal(true)} value={selectedSubCategory} placeholder="큰 관심사 선택 후 자동 기입" className={`${inputCls} cursor-pointer bg-white`} />
          </div>
        </div>

        {/* 대표 사진 */}
        <div>
          <input id="img" type="file" accept="image/png,image/gif,image/jpeg" onChange={handleFileChange} className="hidden" />
          <label htmlFor="img">
            <div className="w-full py-3 bg-[#A6836F] hover:bg-[#8a6c58] text-white text-sm font-medium rounded-lg text-center cursor-pointer transition-colors">여기를 클릭해 모임 대표사진을 설정해보세요</div>
          </label>
          {!preview ? (
            <div className="mt-3 w-full h-[300px] border-2 border-dashed border-[#A6836F] rounded-xl flex items-center justify-center text-gray-400 text-sm" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              이미지 미리보기가 없습니다. 이미지를 업로드하거나 드래그하세요.
            </div>
          ) : (
            <div className="mt-3 relative w-full h-[300px] rounded-xl overflow-hidden">
              <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setCropModalOpen(true)} className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                <FiCrop className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 모임 이름 */}
        <div>
          <label className={`${labelCls} block mb-1`}>모임 이름</label>
          <input className={inputCls} placeholder="모임 이름을 입력하세요" {...register("title", { required: "필수입력 요소." })} />
        </div>

        {/* 간략한 설명 */}
        <div>
          <label className={`${labelCls} block mb-1`}>간략한 설명</label>
          <input className={inputCls} placeholder="모임에 대한 간략한 설명을 넣어보세요" {...register("subTitle", { required: "필수입력 요소." })} />
        </div>

        {/* 내용 */}
        <div>
          <label className={`${labelCls} block mb-1`}>내용</label>
          <textarea rows={10} className={`${inputCls} resize-none`} placeholder="내용을 입력하세요" {...register("content", { required: "필수입력 요소." })} />
        </div>

        {/* 정원 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <label className={labelCls}>정원 (10~300명)</label>
          <div className="col-span-3">
            <input type="number" min={10} max={300} className={inputCls} placeholder="숫자만 입력" {...register("maxMember", { required: "필수입력 요소." })} />
          </div>
        </div>

        {/* 제출 버튼 */}
        <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl transition-colors">
          모임 만들기
        </button>
      </div>

      <MeetingCreate1 open={openCategoryModal} handleCloseModal={() => setOpenCategoryModal(false)} FadHandleClick={handleCategorySelect} />
      <CategoryModalSub open={openSubCategoryModal} onClose={() => setOpenSubCategoryModal(false)} onSubCategorySelect={handleSubCategorySelect} mainCategory={selectedCategory} />
      {cropModalOpen && <ImageCropper src={preview} onCropComplete={handleCropComplete} onClose={() => setCropModalOpen(false)} />}

      <CustomSnackbarWithTimer open={snackbar.open} message={snackbar.msg} severity="warning" onClose={() => setSnackbar((p) => ({ ...p, open: false }))} duration={3000} />
    </form>
  );
};

export default ClubCreate;
