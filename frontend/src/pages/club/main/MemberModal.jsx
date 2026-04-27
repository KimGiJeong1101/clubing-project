import React from "react";
import { FiX } from "react-icons/fi";
import CustomButton from "../../../components/club/CustomButton";
import axiosInstance from "../../../utils/axios";
import { useSelector } from "react-redux";

const MemberModal = ({ open, onClose, members, clubNumber, setSnackbarMessage, handleSnackbarClick }) => {
  const user = useSelector((state) => state.user);

  const deleteMemberInClub = async (nickName) => {
    await axiosInstance.post(`/clubs/deleteMember/${nickName}/${clubNumber}`);
    setSnackbarMessage("강퇴 완료되었습니다.");
    handleSnackbarClick();
    onClose();
  };

  const mandateManager = async (nickName) => {
    const response = await axiosInstance.post(`/clubs/mandateManager/${nickName}/${clubNumber}`);
    if (response.data === "성공") {
      setSnackbarMessage("위임 완료되었습니다.");
      handleSnackbarClick();
      onClose();
    }
    if (response.data === "이미 있음") {
      setSnackbarMessage("이미 매니저입니다.");
      handleSnackbarClick();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[800px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-nanum-bold text-gray-800">회원 정보</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {members && members.length > 0 ? (
            members.map((member, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all hover:scale-[1.01] cursor-pointer">
                <img src={member?.thumbnailImage || "https://via.placeholder.com/50"} alt={member.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-nanum-bold text-gray-800 truncate">
                    {member.name} <span className="text-gray-400 font-normal">({member.nickName})</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.userData.user.nickName === members[0].nickName && index !== 0 && (
                    <CustomButton className="!rounded-2xl !px-3 !py-1.5 !text-sm" onClick={() => mandateManager(member.nickName)}>
                      매니저 위임
                    </CustomButton>
                  )}
                  {index !== 0 && (
                    <CustomButton className="!rounded-2xl !px-3 !py-1.5 !text-sm" onClick={() => deleteMemberInClub(member.nickName)}>
                      추방
                    </CustomButton>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">멤버 정보가 없습니다.</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;
