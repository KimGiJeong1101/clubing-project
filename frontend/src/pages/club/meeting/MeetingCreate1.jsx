import React from "react";
import { FiCoffee, FiBook, FiStar, FiNavigation, FiMusic, FiUsers, FiDollarSign, FiGlobe, FiHeart, FiAnchor, FiFeather } from "react-icons/fi";

const MeetingCreate1 = ({ open, handleCloseModal, FadHandleClick }) => {
  const categories = [
    { color: "#71ABF0", icon: <FiCoffee size={36} />, text: "푸드·드링크" },
    { color: "#DC6A5A", icon: <FiBook size={36} />, text: "자기계발" },
    { color: "#9363D1", icon: <FiStar size={36} />, text: "취미" },
    { color: "#D7E56E", icon: <FiNavigation size={36} />, text: "액티비티" },
    { color: "#EE7E8C", icon: <FiMusic size={36} />, text: "파티" },
    { color: "#4C5686", icon: <FiUsers size={36} />, text: "소셜게임" },
    { color: "#F7D16E", icon: <FiFeather size={36} />, text: "문화·예술" },
    { color: "#C25BA1", icon: <FiDollarSign size={36} />, text: "N잡·재테크" },
    { color: "#DEB650", icon: <FiHeart size={36} />, text: "연애·사랑" },
    { color: "#78C17C", icon: <FiCoffee size={36} />, text: "여행·나들이" },
    { color: "#828ED6", icon: <FiAnchor size={36} />, text: "동네·또래" },
    { color: "#8E44AD", icon: <FiGlobe size={36} />, text: "외국어" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={handleCloseModal} />

      <div className="relative z-10 bg-white rounded-[30px] border-2 border-black shadow-2xl p-8" style={{ width: 650, height: 520 }}>
        <h2 className="text-2xl font-bold text-center mb-5 text-primary-800">관심사 선택</h2>

        <div className="grid grid-cols-4 gap-4">
          {categories.map((item, index) => (
            <div key={index} className="flex flex-col items-center transition-transform duration-300 hover:scale-105 cursor-pointer" onClick={() => FadHandleClick(item.text)}>
              <div className="flex items-center justify-center w-[100px] h-[100px] rounded-full text-white mb-2 transition-opacity duration-300 hover:opacity-80" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <span className="text-center text-[18px] font-[550]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingCreate1;
