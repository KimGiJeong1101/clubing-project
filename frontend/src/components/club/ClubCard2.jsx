import React from "react";
import { FiUsers, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ClubCard2 = ({ clubList }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.userData?.user || {});

  return (
    <div className="space-y-3">
      {clubList.map((item) => (
        <div key={item._id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden flex cursor-pointer transition-all duration-300 h-[120px] border border-gray-100" onClick={() => navigate(`/clubs/main?clubNumber=${item._id}`)}>
          {/* 내가 만든 모임 뱃지 */}
          {item.admin === user.email && <span className="absolute top-2 right-2 z-10 bg-primary-600 text-white text-[10px] font-nanum-bold px-2 py-0.5 rounded-full shadow-sm">내가 만든 모임</span>}

          {/* 이미지 */}
          <div className="flex-shrink-0 w-[110px] overflow-hidden">
            <img src={`http://localhost:4000/${item.img}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>

          {/* 내용 */}
          <div className="flex flex-col flex-1 px-3.5 py-3 min-w-0 justify-between">
            <div>
              <h3 className="text-sm font-nanum-bold text-gray-900 truncate mb-0.5">{item.title}</h3>
              <p className="text-xs text-gray-500 truncate">{item.subTitle}</p>
            </div>
            <div className="flex items-center justify-between">
              {item.region?.district && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{item.region.district}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                <FiUsers className="w-3 h-3" />
                <span>
                  {item.members?.length}/{item.maxMember}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClubCard2;
