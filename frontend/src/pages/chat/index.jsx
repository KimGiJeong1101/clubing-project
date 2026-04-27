import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getChatByClubid, firstMessageGet, OlderMessageGet, loadMessagesBefore, searchMessages, loadMessagesAround } from "../../store/actions/chatActions";
import io from "socket.io-client";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ImageModal from "./ImageModal";
import CustomSnackbarWithTimer from "../../components/auth/Snackbar";
import SearchInput from "./SearchInput";
import axiosInstance from "../../utils/axios";

const ChatPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clubNumber = searchParams.get("clubNumber");

  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const userData = useSelector((state) => state.user.userData.user);
  const userId = userData._id;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessageReceived, setNewMessageReceived] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // 백엔드 검색 결과 (DESC 정렬: index 0 = 가장 최신)
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // around-mode: loadMessagesAround 로 messages 를 교체한 상태
  // → 위로 스크롤 시 skip 방식 대신 타임스탬프 커서 방식 사용
  const [isAroundMode, setIsAroundMode] = useState(false);

  // MessageList 초기 스크롤 리셋 키
  const [messageListResetKey, setMessageListResetKey] = useState(0);

  const matchCount = searchResults.length;
  const currentMatchId = searchResults[currentMatchIndex]?._id ?? null;

  // messages ref: handleScroll 등 클로저에서 최신 messages 참조용
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // 클럽 데이터 및 초기 메시지 가져오기
  useEffect(() => {
    if (!clubNumber) return;

    const fetchData = async () => {
      try {
        const actionResult = await dispatch(getChatByClubid(clubNumber));
        setTitle(actionResult.payload.club.title);

        const initialAction = await dispatch(firstMessageGet(clubNumber));
        const initialMessages = [...initialAction.payload].reverse();
        setMessages(initialMessages);
        setSkip(initialMessages.length);
        setIsAroundMode(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("해당 모임에 가입하셔야 채팅방을 이용할 수 있습니다.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchData();
  }, [clubNumber, dispatch]);

  // 소켓 연결
  // message 리스너를 connect 밖에서 한 번만 등록 → 재연결 시 리스너 중복 방지
  useEffect(() => {
    const baseURL = axiosInstance.defaults.baseURL;
    const newSocket = io(baseURL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("소켓 연결됨");
      newSocket.emit("joinRoom", { clubId: clubNumber });
    });

    newSocket.on("message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev; // 중복 방지
        return [...prev, msg];
      });
    });

    newSocket.on("error", (error) => {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("message");
      newSocket.off("error");
      newSocket.close();
    };
  }, [clubNumber, userId]);

  // 검색어 변경 시 인덱스 초기화 + 빈 검색어면 결과 초기화
  useEffect(() => {
    setCurrentMatchIndex(0);
    if (!searchTerm.trim()) {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // 검색어 디바운스 → 백엔드 전체 검색 (400ms)
  // 결과를 DESC 역순으로 저장 → index 0 이 가장 최신 메시지
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await dispatch(searchMessages({ clubId: clubNumber, query: searchTerm.trim() }));
        if (result.payload) {
          const reversed = [...result.payload].reverse();
          setSearchResults(reversed);
          setCurrentMatchIndex(0);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, clubNumber, dispatch]);

  // 현재 매칭 메시지가 로드된 messages 에 없으면 주변 메시지를 불러와 교체
  useEffect(() => {
    if (!currentMatchId) return;

    const isInMessages = messagesRef.current.some((m) => m._id === currentMatchId);
    if (isInMessages) return;

    const targetMsg = searchResults.find((m) => m._id === currentMatchId);
    if (!targetMsg) return;

    dispatch(loadMessagesAround({ clubId: clubNumber, timestamp: targetMsg.timestamp }))
      .then((result) => {
        if (result.payload && result.payload.length > 0) {
          setMessages(result.payload);
          // around-mode 활성화: 타임스탬프 커서 방식으로 이전 메시지 로드
          setIsAroundMode(true);
          setHasMore(true); // 위로 스크롤 가능하게 유지
          setSkip(0); // skip 방식 사용 안 하므로 초기화
        }
      })
      .catch((err) => console.error("loadMessagesAround error:", err));
  }, [currentMatchId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 이전 메시지 가져오기 (위로 스크롤 시)
  // around-mode: 타임스탬프 커서 방식 / 일반 모드: skip 방식
  const handleScroll = async (event) => {
    const container = event.target;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop === 0 && !loading && hasMore) {
      setLoading(true);
      const currentHeight = scrollHeight;
      try {
        let olderMessages;

        if (isAroundMode) {
          // around-mode: 현재 메시지 중 가장 오래된 것의 timestamp 를 커서로 사용
          const oldest = messagesRef.current[0];
          if (!oldest) {
            setLoading(false);
            return;
          }
          const result = await dispatch(loadMessagesBefore({ clubId: clubNumber, before: oldest.timestamp }));
          olderMessages = result.payload;
        } else {
          // 일반 모드: skip 기반
          const result = await dispatch(OlderMessageGet({ clubId: clubNumber, skip }));
          olderMessages = result.payload;
        }

        if (!olderMessages || olderMessages.length === 0) {
          setHasMore(false);
        } else {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const newMsgs = olderMessages.reverse().filter((m) => !existingIds.has(m._id));
            return [...newMsgs, ...prev];
          });

          if (!isAroundMode) {
            setSkip((s) => s + olderMessages.length);
          }

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - currentHeight;
          }, 0);
        }
      } catch (error) {
        console.error("Error fetching older messages:", error);
      } finally {
        setLoading(false);
      }
    }

    setIsAtBottom(scrollTop + clientHeight === scrollHeight);
  };

  const handleSendMessage = () => {
    if (socket && (message.trim() || imageFiles.length > 0)) {
      socket.emit("message", {
        clubId: clubNumber,
        senderId: userId,
        content: message.trim(),
        images: imageFiles,
      });
      setMessage("");
      setImageFiles([]);
      setNewMessageReceived(true);
    } else {
      setSnackbarMessage("메시지 내용이 필요합니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axiosInstance.post("/clubs/chatimage/upload", formData);
      socket.emit("message", {
        clubId: clubNumber,
        senderId: userId,
        content: "",
        images: res.data.urls,
      });
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // 검색 종료 → 최신 메시지 리로드 & around-mode 해제
  const handleCloseSearch = async () => {
    setShowSearchInput(false);
    setSearchTerm("");
    setSearchResults([]);
    setCurrentMatchIndex(0);

    try {
      const action = await dispatch(firstMessageGet(clubNumber));
      const msgs = [...action.payload].reverse();
      setMessages(msgs);
      setSkip(msgs.length);
      setHasMore(true);
      setIsAroundMode(false);
      setMessageListResetKey((k) => k + 1); // 초기 스크롤 플래그 리셋 → 맨 아래로
    } catch (err) {
      console.error("handleCloseSearch reload error:", err);
      setHasMore(true);
      setIsAroundMode(false);
    }
  };

  // DESC 정렬 기준 (index 0 = 최신)
  // ↑ = 오래된 메시지로 이동 = index 증가
  // ↓ = 최신 메시지로 이동 = index 감소
  const handlePrevMatch = () => setCurrentMatchIndex((p) => Math.min(matchCount - 1, p + 1));

  const handleNextMatch = () => setCurrentMatchIndex((p) => Math.max(0, p - 1));

  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);

  return (
    <div
      className="mx-auto flex flex-col bg-[#EAE8E3] rounded-2xl shadow-sm overflow-hidden"
      style={{
        maxWidth: "900px",
        marginBottom: "80px",
        height: "calc(100vh - 140px)",
        minHeight: "500px",
      }}
    >
      <ChatHeader title={title} onFileUpload={handleFileUpload} setShowSearchInput={setShowSearchInput} />

      {showSearchInput && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            setCurrentMatchIndex(0);
          }}
          onClose={handleCloseSearch}
          matchCount={matchCount}
          currentMatchIndex={currentMatchIndex}
          onPrev={handlePrevMatch}
          onNext={handleNextMatch}
          inputRef={searchInputRef}
          isSearching={isSearching}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <MessageList messages={messages} userId={userId} handleScroll={handleScroll} isAtBottom={isAtBottom} newMessageReceived={newMessageReceived} searchTerm={searchTerm} currentMatchId={currentMatchId} resetKey={messageListResetKey} />
      </div>

      <MessageInput message={message} setMessage={setMessage} handleSendMessage={handleSendMessage} handleKeyPress={handleKeyPress} />

      <ImageModal open={isModalOpen} onClose={handleCloseModal} imageUrl={selectedImage} />

      <CustomSnackbarWithTimer open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </div>
  );
};

export default ChatPage;
