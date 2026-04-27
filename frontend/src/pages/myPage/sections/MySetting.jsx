import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiBell, FiHeadphones, FiHelpCircle } from "react-icons/fi";

const menuItems = [
  { key: "notice", label: "공지사항", icon: <FiBell size={16} /> },
  { key: "support", label: "고객센터", icon: <FiHeadphones size={16} /> },
  { key: "faq", label: "자주 묻는 질문", icon: <FiHelpCircle size={16} /> },
];

const contentMap = {
  notice: { title: "공지사항", body: "여기에 공지사항 내용을 추가하세요." },
  support: { title: "고객센터", body: "여기에 고객센터 정보를 추가하세요." },
  faq: { title: "자주 묻는 질문", body: "여기에 자주 묻는 질문과 답변을 추가하세요." },
};

const MySetting = () => {
  const [view, setView] = useState("");

  const handleButtonClick = (section) => {
    setView(view === section ? "" : section);
  };

  return (
    <div className="flex flex-col max-w-[600px] mx-auto gap-2">
      {menuItems.map(({ key, label, icon }) => (
        <div key={key}>
          <button
            onClick={() => handleButtonClick(key)}
            className={`w-full flex items-center justify-between text-left px-4 py-3.5 rounded-xl font-nanum-bold text-sm transition-all duration-200
              ${view === key ? "bg-primary-600 text-white shadow-sm" : "bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={view === key ? "text-white/80" : "text-primary-400"}>{icon}</span>
              {label}
            </div>
            {view === key ? <FiChevronUp className="w-4 h-4 opacity-70" /> : <FiChevronDown className="w-4 h-4 opacity-40" />}
          </button>

          {view === key && (
            <div className="mt-1 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-nanum-bold text-gray-800 mb-2">{contentMap[key].title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{contentMap[key].body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MySetting;
