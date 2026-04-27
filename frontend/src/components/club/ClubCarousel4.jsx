import React from "react";
import ClubCard3 from "./ClubCard3";
import { FiMessageCircle } from "react-icons/fi";

const ClubCarousel4 = ({ clubList }) => {
  if (!clubList || clubList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FiMessageCircle size={48} className="mb-3 text-gray-200" />
        <p className="text-sm font-nanum-bold">참여 중인 모임의 채팅방이 없습니다.</p>
        <p className="text-xs mt-1 text-gray-300">모임에 가입하면 채팅이 가능해요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ClubCard3 clubList={clubList} />
    </div>
  );
};

export default ClubCarousel4;
