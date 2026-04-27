import React from "react";
import { FiSearch, FiCamera } from "react-icons/fi";

const ChatHeader = ({ title, onFileUpload, setShowSearchInput }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (onFileUpload) {
      onFileUpload(files);
    }
  };

  const toggleSearchInput = () => {
    // 아이콘은 열기 전용, 닫기는 SearchInput 의 X 버튼으로
    setShowSearchInput(true);
  };

  const truncatedTitle = title.length > 20 ? `${title.slice(0, 20)}...` : title;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-2xl">
      {/* 채팅방 이름 */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <h1 className="text-lg font-nanum-bold text-gray-900 truncate">{truncatedTitle || "채팅방"}</h1>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={toggleSearchInput} aria-label="search" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
          <FiSearch size={20} />
        </button>

        <div>
          <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="flex items-center justify-center p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
              <FiCamera size={20} />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
