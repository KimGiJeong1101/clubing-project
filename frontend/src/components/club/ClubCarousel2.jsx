import React from "react";
import ClubCard2 from "./ClubCard2";

const ClubCarousel2 = ({ clubList }) => {
  if (!clubList || clubList.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <span className="text-3xl mb-3">🏕️</span>
        <p className="text-sm font-nanum-bold text-gray-600">가입한 모임이 없어요</p>
        <p className="text-xs text-gray-400 mt-1">모임을 찾아 가입해보세요!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <ClubCard2 clubList={clubList} />
    </div>
  );
};

export default ClubCarousel2;
