import React from "react";
import { FiFeather, FiAnchor, FiCoffee, FiStar, FiNavigation, FiBook, FiUsers, FiMusic, FiDollarSign, FiGlobe, FiHeart } from "react-icons/fi";

const CategoryModal = ({ open, onClose, onCategorySelect }) => {
  const handleCategoryClick = (category) => {
    onCategorySelect(category);
  };

  const FadHandleClick = (event) => {
    const ariaLabel = event.currentTarget.getAttribute("aria-label");
    console.log(`Selected category: ${ariaLabel}`);
    handleCategoryClick(ariaLabel);
    onClose();
  };

  if (!open) return null;

  const categories = [
    { label: "문화·예술", icon: <FiFeather size={28} />, color: "text-green-600" },
    { label: "액티비티", icon: <FiAnchor size={28} />, color: "text-blue-600" },
    { label: "푸드·드링크", icon: <FiCoffee size={28} />, color: "text-amber-700" },
    { label: "취미", icon: <FiStar size={28} />, color: "text-yellow-400" },
    { label: "여행·동행", icon: <FiNavigation size={28} />, color: "text-sky-400" },
    { label: "자기계발", icon: <FiBook size={28} />, color: "text-amber-800" },
    { label: "동네·또래", icon: <FiUsers size={28} />, color: "text-[#D6B095]" },
    { label: "파티·게임", icon: <FiMusic size={28} />, color: "text-[#B855B9]" },
    { label: "재테크", icon: <FiDollarSign size={28} />, color: "text-[#F47378]" },
    { label: "외국어", icon: <FiGlobe size={28} />, color: "text-gray-700" },
    { label: "연애·사랑", icon: <FiHeart size={28} />, color: "text-red-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-white border-2 border-black shadow-2xl p-8" style={{ width: 600, height: 430 }}>
        <h2 className="text-2xl font-bold text-center mb-2">관심사 선택</h2>
        <hr className="mb-4" />

        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.label} className="flex flex-col items-center">
              <button aria-label={cat.label} onClick={FadHandleClick} className={`flex items-center justify-center w-[70px] h-[70px] rounded-full bg-gray-100 shadow-md hover:bg-gray-200 transition-colors my-[10px] ${cat.color}`}>
                {cat.icon}
              </button>
              <span className="text-center text-sm">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
