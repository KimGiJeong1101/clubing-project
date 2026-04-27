import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const VoteCreationForm = ({ options, setOptions, allowMultiple, setAllowMultiple, anonymous, setAnonymous, endTime, setEndTime, title, setTitle, category, setCategory }) => {
  const categories = ["자유글", "관심사공유", "모임후기", "가입인사", "공지사항(전체알림)", "투표"];

  // 옵션의 최소 개수를 2로 설정
  useEffect(() => {
    if (options.length < 2) {
      setOptions(["", ""]);
    }
  }, [options, setOptions]);

  // 옵션 항목 추가
  const addOption = () => {
    setOptions([...options, ""]);
  };

  // 옵션 값 변경
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 옵션 항목 삭제
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // 현재 날짜와 시간을 'yyyy-MM-ddTHH:mm' 형식으로 반환
  const getTodayDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 로컬 시간으로 변환
    return now.toISOString().slice(0, 16); // ISO 문자열에서 'yyyy-MM-ddTHH:mm' 형식 추출
  };

  // 하루 뒤의 날짜와 시간을 'yyyy-MM-ddTHH:mm' 형식으로 반환
  const getTomorrowDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 로컬 시간으로 변환
    return now.toISOString().slice(0, 16); // ISO 문자열에서 'yyyy-MM-ddTHH:mm' 형식 추출
  };

  // 기본값 설정
  useEffect(() => {
    if (!endTime) {
      setEndTime(getTomorrowDateTime());
    }
  }, [endTime, setEndTime]);

  return (
    <div className="p-4">
      {/* 투표 제목 */}
      <div className="mb-4">
        <input type="text" placeholder="투표 제목" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5]" />
      </div>

      {/* Category select */}
      <div className="mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5] bg-white">
          <option value="">Category 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 투표 옵션 목록 */}
      {options.map((option, index) => (
        <div key={index} className="flex items-center mb-2 gap-2">
          <input type="text" placeholder={`투표 항목 ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5]" />
          {options.length > 2 && (
            <button onClick={() => removeOption(index)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
              <FiX size={18} />
            </button>
          )}
        </div>
      ))}

      {/* 항목 추가 버튼 */}
      <button onClick={addOption} className="mt-2 px-4 py-2 rounded-xl text-sm font-nanum-bold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border border-primary-100">
        항목 추가
      </button>

      {/* 익명 투표 체크박스 */}
      <div className="mt-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="w-4 h-4 accent-[#A67153]" />
          익명 투표
        </label>
      </div>

      {/* 투표 종료 시간 */}
      <div className="mt-4">
        <label className="block text-xs text-gray-500 mb-1">투표 종료 시간</label>
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} min={getTodayDateTime()} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DBC7B5]" />
      </div>
    </div>
  );
};

export default VoteCreationForm;
