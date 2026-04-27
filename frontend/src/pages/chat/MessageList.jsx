import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axiosInstance from "../../utils/axios";

/* ─────────────────────────────────────────
   유틸 함수
───────────────────────────────────────── */
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const adjustedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${ampm} ${adjustedHours}:${formattedMinutes}`;
};

const groupMessagesByDate = (messages) =>
  messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

const fetchUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch {
    return { name: "Unknown", profilePic: "" };
  }
};

const emojiRegex =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}-\u{1F0CF}]/u;

const isOnlyEmoji = (text) => {
  const cleaned = text.replace(/\s/g, "");
  return cleaned.length > 0 && [...cleaned].every((c) => emojiRegex.test(c));
};

const countEmojis = (text) => [...text].filter((c) => emojiRegex.test(c)).length;

const isUrl = (text) => /(https?:\/\/[^\s]+)|(www\.[^\s]+)/.test(text);

/* ─────────────────────────────────────────
   텍스트 하이라이트 컴포넌트
───────────────────────────────────────── */
const HighlightText = ({ text, searchTerm, isCurrent }) => {
  if (!searchTerm?.trim() || !text) return <>{text}</>;
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className={`rounded-sm not-italic px-0.5 ${
              isCurrent ? "bg-yellow-400 text-gray-900" : "bg-yellow-200 text-gray-800"
            }`}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

/* ─────────────────────────────────────────
   커스텀 이미지 뷰어 (react-slick 대체)
───────────────────────────────────────── */
const ImageViewer = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((p) => Math.max(0, p - 1));
      if (e.key === "ArrowRight") setCurrent((p) => Math.min(images.length - 1, p + 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  const prev = () => setCurrent((p) => Math.max(0, p - 1));
  const next = () => setCurrent((p) => Math.min(images.length - 1, p + 1));

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.93)" }}
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-800 hover:bg-gray-100 shadow-lg transition-colors"
        aria-label="닫기"
      >
        <FiX size={18} />
      </button>

      {/* 이미지 영역 */}
      <div
        className="relative flex items-center justify-center w-full px-14 sm:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이전 화살표 */}
        <button
          onClick={prev}
          disabled={current === 0}
          className={`absolute left-2 sm:left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-xl hover:bg-gray-100 transition-all ${
            current === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FiChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* 이미지 */}
        <img
          key={current}
          src={images[current].original}
          alt={`이미지 ${current + 1}`}
          className="max-w-full object-contain rounded-2xl shadow-2xl"
          style={{ maxHeight: "80vh" }}
        />

        {/* 다음 화살표 */}
        <button
          onClick={next}
          disabled={current === images.length - 1}
          className={`absolute right-2 sm:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-xl hover:bg-gray-100 transition-all ${
            current === images.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FiChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* 페이지 인디케이터 + 카운터 */}
      <div
        className="flex flex-col items-center gap-2 mt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === current
                    ? "w-5 h-2 bg-white"
                    : "w-2 h-2 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <span className="text-white/50 text-xs">
            {current + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   이미지 그리드 (메시지 내 사진)
───────────────────────────────────────── */
const MessageImageGrid = ({ images, onImageClick }) => {
  const count = images.length;

  if (count === 1) {
    return (
      <div
        className="max-w-[200px] sm:max-w-[240px] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onImageClick(images, 0)}
      >
        <img
          src={images[0].thumbnail}
          alt="이미지"
          className="w-full h-auto max-h-[200px] object-cover block"
        />
      </div>
    );
  }

  return (
    <div
      className={`grid gap-1 cursor-pointer max-w-[200px] sm:max-w-[240px] ${
        count === 2 ? "grid-cols-2" : "grid-cols-2"
      }`}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className={`overflow-hidden hover:opacity-90 transition-opacity ${
            count === 3 && i === 0 ? "col-span-2 rounded-t-xl" : ""
          } ${
            count === 3 && i > 0
              ? i === 1 ? "rounded-bl-xl" : "rounded-br-xl"
              : ""
          } ${count === 2 ? (i === 0 ? "rounded-l-xl" : "rounded-r-xl") : ""} ${
            count === 4
              ? [
                  "rounded-tl-xl",
                  "rounded-tr-xl",
                  "rounded-bl-xl",
                  "rounded-br-xl",
                ][i] ?? ""
              : ""
          }`}
          onClick={() => onImageClick(images, i)}
        >
          <img
            src={img.thumbnail}
            alt={`이미지 ${i + 1}`}
            className="w-full aspect-square object-cover block"
          />
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   MessageList
───────────────────────────────────────── */
const MessageList = ({
  messages,
  userId,
  handleScroll,
  isAtBottom,
  newMessageReceived,
  searchTerm = "",
  currentMatchId = null,
  resetKey = 0,          // 이 값이 바뀌면 초기 스크롤 플래그를 리셋
}) => {
  const containerRef = useRef(null);
  const [userProfiles, setUserProfiles] = useState({});

  // 이미지 뷰어 상태
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // 검색 매칭 메시지 ref 맵
  const matchRefMap = useRef({});

  const userData = useSelector((state) => state.user.userData.user);

  /* 이미지 클릭 → 뷰어 열기 */
  const handleImageClick = useCallback((images, index) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const handleViewerClose = useCallback(() => {
    setViewerOpen(false);
  }, []);

  /* 현재 검색 매칭 메시지로 스크롤
     messages 도 의존성에 포함 → 주변 메시지 로드 후에도 스크롤 실행됨 */
  useEffect(() => {
    if (currentMatchId && matchRefMap.current[currentMatchId]) {
      matchRefMap.current[currentMatchId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentMatchId, messages]);

  /* 사용자 프로필 로드 */
  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueIds = [...new Set(messages.map((msg) => msg.sender)), userId];
      const profiles = await Promise.all(uniqueIds.map(fetchUserById));
      const map = uniqueIds.reduce((acc, id, i) => {
        acc[id] = profiles[i];
        return acc;
      }, {});
      setUserProfiles(map);
    };
    fetchUsers();
  }, [messages, userId]);

  /* 새 메시지 수신 시 맨 아래로 스크롤 (사용자가 하단에 있을 때만) */
  useEffect(() => {
    if (isAtBottom && newMessageReceived && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isAtBottom, newMessageReceived]);

  /* 초기 로드 시 한 번만 맨 아래로 스크롤
     - 이전 메시지 추가(위에 prepend) 시에는 발화 안 함 → 스크롤 유지
     - resetKey 가 바뀌면 플래그를 리셋 → 재로드 시 다시 맨 아래로 */
  const initialScrollDone = useRef(false);
  useEffect(() => {
    initialScrollDone.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (currentMatchId) return;                        // 검색 스크롤이 담당
    if (initialScrollDone.current) return;             // 이미 한 번 스크롤 완료
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      initialScrollDone.current = true;
    }
  }, [messages, currentMatchId]);

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      <div
        className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-4"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {Object.keys(groupedMessages).map((date, dateIndex) => (
          <div key={dateIndex}>
            {/* 날짜 구분선 */}
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 text-white text-xs">
                {date}
              </span>
            </div>

            <div className="space-y-2">
              {groupedMessages[date].map((msg, index) => {
                const isMine = msg.sender === userId;
                const profile = userProfiles[msg.sender];
                const hasText = msg.content && msg.content.trim().length > 0;
                const hasImages = msg.images && msg.images.length > 0;
                const emojiCount = hasText ? countEmojis(msg.content) : 0;
                // 이모지 1개일 때만 특별 처리 (2개 이상은 일반 텍스트와 동일)
                const onlyEmoji = hasText && isOnlyEmoji(msg.content) && emojiCount === 1;
                const emojiFontSize = "2.2rem";

                const isSearchMatch =
                  searchTerm.trim() &&
                  msg.content &&
                  msg.content.toLowerCase().includes(searchTerm.toLowerCase());
                const isCurrent = msg._id === currentMatchId;

                return (
                  <div
                    key={msg._id || index}
                    ref={isSearchMatch ? (el) => { if (el) matchRefMap.current[msg._id] = el; } : null}
                    className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    {/* 상대방 프로필 사진 */}
                    {!isMine && (
                      <div className="flex-shrink-0 self-start mt-1">
                        <img
                          src={profile?.profilePic || ""}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      </div>
                    )}

                    <div
                      className={`flex flex-col max-w-[70%] sm:max-w-[60%] ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {/* 상대방 이름 */}
                      {!isMine && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">
                          {profile?.nickName || "Unknown"}
                        </span>
                      )}

                      {/* 텍스트 말풍선 */}
                      {hasText && (
                        <div
                          className={`flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`break-words transition-all ${
                              onlyEmoji && isMine
                                ? `px-5 py-3.5 bg-primary-200 text-gray-800 rounded-2xl rounded-tr-md ${isCurrent ? "ring-2 ring-yellow-400" : ""}`
                                : onlyEmoji && !isMine
                                ? `px-5 py-3.5 bg-white text-gray-800 rounded-2xl rounded-tl-md border border-gray-200 shadow-sm ${isCurrent ? "ring-2 ring-yellow-400" : ""}`
                                : isMine
                                ? `px-3.5 py-2.5 bg-primary-200 text-gray-800 rounded-2xl rounded-tr-md ${isCurrent ? "ring-2 ring-yellow-400" : ""}`
                                : `px-3.5 py-2.5 bg-white text-gray-800 rounded-2xl rounded-tl-md border border-gray-200 shadow-sm ${isCurrent ? "ring-2 ring-yellow-400" : ""}`
                            }`}
                          >
                            <span
                              style={{
                                fontSize: onlyEmoji ? emojiFontSize : "0.875rem",
                                lineHeight: onlyEmoji ? 1.2 : 1.5,
                              }}
                            >
                              {isUrl(msg.content) ? (
                                <a
                                  href={
                                    msg.content.startsWith("http")
                                      ? msg.content
                                      : `http://${msg.content}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline underline-offset-2"
                                >
                                  {msg.content}
                                </a>
                              ) : (
                                <HighlightText
                                  text={msg.content}
                                  searchTerm={searchTerm}
                                  isCurrent={isCurrent}
                                />
                              )}
                            </span>
                          </div>
                          {/* 타임스탬프 */}
                          <span className="text-[0.62rem] text-gray-400 whitespace-nowrap mb-0.5 flex-shrink-0">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      {/* 이미지 그리드 */}
                      {hasImages && (
                        <div
                          className={`flex items-end gap-1.5 mt-0.5 ${
                            isMine ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <MessageImageGrid
                            images={msg.images}
                            onImageClick={handleImageClick}
                          />
                          {/* 텍스트 없을 때만 타임스탬프 표시 */}
                          {!hasText && (
                            <span className="text-[0.62rem] text-gray-400 whitespace-nowrap mb-0.5 flex-shrink-0">
                              {formatTime(msg.timestamp)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 내 메시지는 오른쪽에 여백 없음 (프로필 없음) */}
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* 커스텀 이미지 뷰어 */}
      {viewerOpen && (
        <ImageViewer
          images={viewerImages}
          startIndex={viewerIndex}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
};

export default MessageList;
