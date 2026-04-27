import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiUsers, FiMapPin } from "react-icons/fi";

const ClubListCard = ({ clubList }) => {
  const navigate = useNavigate();

  if (!clubList || clubList.length === 0) return null;

  return (
    <>
      {clubList.map((club) => (
        <div
          key={club._id}
          className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
          onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
        >
          {/* 이미지 */}
          <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
            <img
              src={`http://localhost:4000/${club.img}`}
              alt={club.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* 카테고리 뱃지 */}
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary-700 text-[11px] font-nanum-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {club.mainCategory}
            </span>
          </div>

          {/* 콘텐츠 */}
          <div className="flex flex-col flex-1 p-4">
            <h3 className="text-base font-nanum-bold text-gray-900 truncate mb-1">
              {club.title}
            </h3>
            <p className="text-sm text-gray-500 truncate mb-2 leading-relaxed">
              {club.subTitle}
            </p>

            {club.region?.district && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <FiMapPin className="w-3 h-3 flex-shrink-0" />
                <span>{club.region.district}</span>
              </div>
            )}

            {/* 멤버 + 이동 버튼 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-2">
                {/* 아바타 그룹 */}
                <div className="flex -space-x-2">
                  {club.memberInfo?.slice(0, 4).map((m, i) => (
                    <img
                      key={i}
                      src={m.thumbnailImage || "https://via.placeholder.com/32"}
                      alt=""
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiUsers className="w-3.5 h-3.5" />
                  <span>{club.members?.length}<span className="text-gray-300 mx-0.5">/</span>{club.maxMember}</span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-primary-50 group-hover:bg-primary-500 flex items-center justify-center transition-all duration-200">
                <FiArrowRight className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ClubListCard;
