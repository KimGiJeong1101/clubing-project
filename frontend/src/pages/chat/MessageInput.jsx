import React, { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import Picker from "@emoji-mart/react";

const MessageInput = ({ message, setMessage, handleSendMessage, handleKeyPress }) => {
  const [showPicker, setShowPicker] = useState(false);
  const messageInputRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    if (emoji && messageInputRef.current) {
      const start = messageInputRef.current.selectionStart || 0;
      const end = messageInputRef.current.selectionEnd || 0;
      const newMessage = message.slice(0, start) + emoji.native + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        messageInputRef.current.selectionStart = messageInputRef.current.selectionEnd = start + emoji.native.length;
        messageInputRef.current.focus();
      }, 0);
      setShowPicker(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-gray-100 rounded-b-2xl">
      {/* 이모지 버튼 */}
      <button onClick={() => setShowPicker((prev) => !prev)} className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="이모지 선택">
        <span className="text-2xl leading-none">😊</span>
      </button>

      {/* 입력창 */}
      <div className="relative flex-1">
        <input ref={messageInputRef} type="text" placeholder="메시지를 입력하세요" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-all" />
        {showPicker && (
          <div className="absolute bottom-12 left-0 z-50">
            <Picker onEmojiSelect={handleEmojiClick} />
          </div>
        )}
      </div>

      {/* 전송 버튼 */}
      <button onClick={handleSendMessage} className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors shadow-sm" aria-label="메시지 전송">
        <FiSend size={18} className="text-white" />
      </button>
    </div>
  );
};

export default MessageInput;
