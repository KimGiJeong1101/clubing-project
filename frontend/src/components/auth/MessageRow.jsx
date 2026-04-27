import React from "react";
import CustomCheckbox from "../club/CustomCheckbox";
import { format } from "date-fns";

const MessageRow = ({ message, selectedMessages, handleReadMessage }) => {
  const handleCheckboxClick = (event) => {
    event.stopPropagation();
    handleReadMessage(message._id);
  };

  return (
    <div className="flex items-start gap-3 px-3 py-3 border-b border-gray-100 last:border-0 hover:bg-primary-50/50 transition-colors">
      {/* 체크박스 */}
      <div className="flex items-center pt-0.5 flex-shrink-0">
        <CustomCheckbox checked={selectedMessages.includes(message._id)} onClick={handleCheckboxClick} />
      </div>

      {/* 메시지 내용 */}
      <div className="flex-1 min-w-0">
        {/* 발신자 + 날짜 */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-gray-500 truncate">{message.sender}</span>
          <span className="text-[0.65rem] text-gray-400 flex-shrink-0">{format(new Date(message.date), "MM.dd HH:mm")}</span>
        </div>

        {/* 제목 */}
        <p className="text-sm font-nanum-bold text-gray-800 truncate mb-1">{message.title}</p>

        {/* 내용 미리보기 + 읽음 상태 */}
        <div className="flex items-end justify-between gap-2">
          <p className="text-xs text-gray-500 truncate flex-1">{message.content}</p>
          <span className={`flex-shrink-0 text-[0.65rem] font-medium px-1.5 py-0.5 rounded-full ${message.isRead ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-500"}`}>{message.isRead ? "읽음" : "안 읽음"}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageRow;
