import React, { useState, useEffect } from "react";
import UnreadMessages from "./UnreadMessages";
import ReadMessages from "./ReadMessages";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../utils/axios";

const MyMessage = () => {
  const [activeTab, setActiveTab] = useState("unreadMessages");
  const [messages, setMessages] = useState({
    readCount: 0,
    unreadCount: 0,
  });

  const user = useSelector((state) => state.user?.userData?.user || {});

  useEffect(() => {
    if (user.email) {
      axiosInstance
        .get(`/users/messages/counts/${user.email}`)
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [messages]);

  const tabs = [
    { key: "unreadMessages", label: "안 읽음", count: messages.unreadCount },
    { key: "readMessages", label: "읽음", count: messages.readCount },
  ];

  return (
    <div className="max-w-[640px] mx-auto">
      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-nanum-bold transition-all duration-200 select-none
              ${activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-all duration-200
                ${activeTab === key ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-colors duration-300">
        {activeTab === "unreadMessages" && <UnreadMessages />}
        {activeTab === "readMessages" && <ReadMessages />}
      </div>
    </div>
  );
};

export default MyMessage;
