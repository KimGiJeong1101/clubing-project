import React from "react";
import { FiSearch, FiX, FiChevronUp, FiChevronDown, FiLoader } from "react-icons/fi";

// searchResults 는 DESC 정렬 (index 0 = 가장 최신)
// ↑ (onPrev) = 오래된 메시지로 → index 증가 → 최고령(index === matchCount-1)에서 비활성
// ↓ (onNext) = 최신 메시지로  → index 감소 → 최신(index === 0)에서 비활성
const SearchInput = ({
  searchTerm,
  setSearchTerm,
  onClose,
  matchCount,
  currentMatchIndex,
  onPrev,
  onNext,
  inputRef,
  isSearching = false,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
      {/* 검색 입력창 */}
      <div className="flex items-center flex-1 rounded-full border border-gray-200 px-3 py-1.5 bg-gray-50 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-100 transition-all">
        {isSearching ? (
          <span className="flex-shrink-0 mr-2 text-primary-400 animate-spin">
            <FiLoader size={14} />
          </span>
        ) : (
          <FiSearch size={14} className="flex-shrink-0 mr-2 text-gray-400" />
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder="메시지 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="입력 지우기"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* 결과 카운터: 1/N = 가장 최신, N/N = 가장 오래된 */}
      {searchTerm.trim() && !isSearching && (
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 min-w-[48px] text-center">
          {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : "없음"}
        </span>
      )}

      {/* 위/아래 이동 버튼 */}
      {searchTerm.trim() && matchCount > 0 && !isSearching && (
        <div className="flex gap-0.5 flex-shrink-0">
          {/* ↑ = 더 오래된 메시지로 이동 */}
          <button
            onClick={onPrev}
            disabled={currentMatchIndex === matchCount - 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-600"
            aria-label="더 오래된 결과"
          >
            <FiChevronUp size={16} />
          </button>
          {/* ↓ = 더 최신 메시지로 이동 */}
          <button
            onClick={onNext}
            disabled={currentMatchIndex === 0}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-600"
            aria-label="더 최신 결과"
          >
            <FiChevronDown size={16} />
          </button>
        </div>
      )}

      {/* 검색창 닫기 X 버튼 */}
      <button
        onClick={onClose}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        aria-label="검색 닫기"
      >
        <FiX size={17} />
      </button>
    </div>
  );
};

export default SearchInput;
