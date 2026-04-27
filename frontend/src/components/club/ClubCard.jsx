import React from "react";
import { FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ClubCard = ({ club }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
    >
      {/* 썸네일 */}
      <div className="w-full aspect-video overflow-hidden bg-gray-100">
        <img
          src={`http://localhost:4000/${club.img}`}
          alt={club.title}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="p-3">
        <p className="text-sm font-nanum-bold text-gray-900 truncate mb-1.5 group-hover:text-primary-600 transition-colors">
          {club.title}
        </p>
        <p className="text-xs text-gray-400 truncate mb-2">{club.subTitle}</p>

        <div className="flex items-center justify-between">
          {club.region?.district && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiMapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{club.region.district}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-primary-500 ml-auto">
            <FiUsers className="w-3 h-3" />
            <span>{club.members?.length}/{club.maxMember}명</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
