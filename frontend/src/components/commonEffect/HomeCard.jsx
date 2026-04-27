import React from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiArrowRight } from "react-icons/fi";

const HomeCard = ({ club }) => {
  const navigate = useNavigate();
  if (!club) return null;

  const { adminImage, memberImages, title, subTitle, img, _id, mainCategory, members } = club;
  const imgUrl = img ? `http://localhost:4000/${img}` : "https://via.placeholder.com/320x200";

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => navigate(`/clubs/main?clubNumber=${_id}`)}>
      {/* 이미지 */}
      <div className="relative h-40 overflow-hidden">
        <img src={imgUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {/* 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 카테고리 뱃지 */}
        {mainCategory && <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-primary-700 text-[11px] font-nanum-bold px-2.5 py-0.5 rounded-full shadow-sm">{mainCategory}</span>}

        {/* 하단 오버레이: 어드민 + 타이틀 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <img src={adminImage || "https://via.placeholder.com/40"} alt="admin" className="w-7 h-7 rounded-full border-2 border-white object-cover flex-shrink-0" />
            <p className="text-white text-sm font-nanum-bold truncate drop-shadow-md leading-tight">{title || "Unknown Club"}</p>
          </div>
          {/* 멤버 아바타 */}
          {memberImages?.length > 0 && (
            <div className="flex items-center gap-0.5">
              {memberImages.slice(0, 4).map((src, i) => (
                <img key={i} src={src || "https://via.placeholder.com/20"} alt="" className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0" />
              ))}
              {memberImages.length > 4 && <span className="text-white text-[10px] ml-1.5 drop-shadow">+{memberImages.length - 4}</span>}
            </div>
          )}
        </div>
      </div>

      {/* 하단 텍스트 영역 */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 truncate flex-1 leading-relaxed">{subTitle || "설명 없음"}</p>
        <div className="flex items-center gap-1 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0">
          <FiArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
