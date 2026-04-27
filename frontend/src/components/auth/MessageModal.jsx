import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FiX } from "react-icons/fi";
import { format } from "date-fns";
import { markMessageAsRead } from "../../store/actions/myMessageActions";

const MessageModal = ({ message, onMessageRead, onClose }) => {
  const dispatch = useDispatch();
  const hasMarkedAsRead = useRef(false);

  useEffect(() => {
    if (message && !message.isRead && !hasMarkedAsRead.current) {
      dispatch(markMessageAsRead(message._id))
        .then(() => {
          if (onMessageRead) onMessageRead(message._id);
          hasMarkedAsRead.current = true;
        })
        .catch((error) => console.error("Error updating message status:", error));
    }
  }, [message, onMessageRead, dispatch]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-nanum-bold text-gray-800">쪽지 내용</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-x-hidden">
          <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[300px]">
            <div className="border-b border-gray-300 pb-2 space-y-1">
              <p className="text-xs text-gray-500">to : {message.sender}</p>
              <div className="text-right">
                <p className="text-xs text-gray-400">{format(new Date(message.date), "yyyy-MM-dd HH:mm")}</p>
              </div>
              <p className="text-xs font-nanum-bold text-gray-800">{message.title}</p>
            </div>
            <p className="text-base text-gray-700 mt-1 break-words">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
