import React, { useEffect, useRef, useState } from "react";
import { Container, Paper } from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getChatByClubid, firstMessageGet, OlderMessageGet } from "../../store/actions/chatActions";
import io from "socket.io-client";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ImageModal from "./ImageModal";
import CustomSnackbarWithTimer from "../../components/auth/Snackbar";
import SearchInput from "./SearchInput";
import axiosInstance from "../../utils/axios";

const ChatPage = () => {
  console.log("ChatPage 컴포넌트 렌더링됨");

  // useLocation 사용하여 URL 쿼리 파라미터 추출
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clubNumber = searchParams.get("clubNumber");

  console.log("쿼리 파라미터 clubNumber:", clubNumber);

  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const userData = useSelector((state) => state.user.userData.user);
  const userId = userData._id;

  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]); // 필터링된 메시지 상태 추가
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessageReceived, setNewMessageReceived] = useState(false); // 새로운 메시지가 왔는지 확인하는 상태 추가

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // 기본값은 오류

  // 여기서 상태 추가: showSearchInput 상태
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef(null); // ref 생성

  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 추가

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 클럽 데이터 가져오기
  useEffect(() => {
    console.log("useEffect 호출됨");
    console.log("현재 clubNumber 값:", clubNumber);

    if (!clubNumber) {
      console.error("Club number is not defined");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("fetchData 함수 호출됨");
        console.log("dispatch 호출 전, 클럽 번호:", clubNumber);
        const actionResult = await dispatch(getChatByClubid(clubNumber));
        console.log("dispatch 후, 결과:", actionResult);
        const clubDetail = actionResult.payload;

        console.log(clubDetail.club.title);
        setTitle(clubDetail.club.title);

        // 초기 메시지 가져오기
        const initialMessagesAction = await dispatch(firstMessageGet(clubNumber));
        // 배열의 복사본을 만들어서 reverse() 적용
        const initialMessages = [...initialMessagesAction.payload].reverse();
        setMessages(initialMessages);
        setSkip(initialMessages.length);
      } catch (error) {
        console.error("Error fetching data:", error);
        // 에러 발생 시 스낵바 열기
        setSnackbarMessage("해당 모임에 가입하셔야 채팅방을 이용할 수 있습니다."); // 원하는 에러 메시지
        setSnackbarSeverity("error"); // 오류로 설정
        setSnackbarOpen(true); // 스낵바 열기
      }
    };

    fetchData();
  }, [clubNumber, dispatch]);

  console.log("유즈이펙트전에");

  useEffect(() => {
    const baseURL = axiosInstance.defaults.baseURL;
    // 소켓 클라이언트 초기화
    const newSocket = io(baseURL); // 서버 주소로 소켓을 초기화. "http://localhost:4000"은 서버의 주소.
    // 위에 io 옆에 `${axiosInstance}` 했는데 안되더라. 이유는 저 부분은 스트링?? 주소?? 만 들어갈수 있는데,
    // axiosInstance는 객체라서. 위에서처럼 변수 선언하고 변수를 쓰거나 아니면 직접 const newSocket = io(`${axiosInstance.defaults.baseURL}`); 이렇게 써주면 됨
    setSocket(newSocket); // 새로 만든 소켓을 상태로 설정하여, 다른 컴포넌트에서도 접근할 수 있게 함.

    // 소켓 연결이 완료되었을 때 실행되는 콜백
    newSocket.on("connect", () => {
      // 소켓이 서버와 연결되었을 때 실행되는 이벤트 리스너.
      console.log("소켓 연결됨"); // 소켓이 성공적으로 연결되었을 때 콘솔에 메시지를 출력.

      // 방에 입장
      newSocket.emit("joinRoom", { clubId: clubNumber }); // 서버에 "joinRoom" 이벤트를 발생시키며, 방에 입장.
      // 예: clubNumber가 "12345"라면, 클라이언트는 서버에 방 "12345"에 들어가겠다고 요청.

      // 메시지를 수신했을 때 실행되는 콜백
      newSocket.on("message", (msg) => {
        // 서버에서 "message" 이벤트를 통해 메시지를 받았을 때 실행되는 콜백 함수.
        // 받은 메시지를 상태에 추가
        setMessages((prevMessages) => [...prevMessages, msg]); // 이전에 받았던 메시지들(prevMessages)에 새로운 메시지(msg)를 추가.
        // 예: 이전에 5개의 메시지가 있었으면, 6번째 메시지를 추가하는 식으로 상태 업데이트.

        // `clubNumber` 값을 확인
        console.log("진짜...." + clubNumber); // 현재 클럽 번호를 콘솔에 출력 (디버깅용). 예: "진짜....12345" 같은 형태로 출력.
      });
    });

    newSocket.on("error", (error) => {
      setSnackbarMessage(error.message); // 에러 메시지 설정
      setSnackbarSeverity("error"); // 오류로 설정
      setSnackbarOpen(true); // 스낵바 열기
    });

    // 소켓 클린업
    return () => {
      if (newSocket) {
        newSocket.off("message"); // 소켓에서 "message" 이벤트 리스너를 제거해 메시지를 더 이상 받지 않도록 함.
        newSocket.close(); // 소켓 연결을 종료. 컴포넌트가 언마운트될 때 실행됨.
      }
    };
  }, [clubNumber, userId]); // 의존성 배열: clubNumber나 userId가 변경될 때마다 이 useEffect가 실행됨.

  // 메시지 필터링
  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = messages.filter((msg) => msg.content.toLowerCase().includes(lowerCaseSearchTerm));
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchTerm, messages]);

  // 이전 메시지 가져오기 (스크롤 시)
  const handleScroll = async (event) => {
    const container = event.target;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop === 0 && !loading && hasMore) {
      setLoading(true);
      const currentHeight = scrollHeight;
      try {
        const olderMessagesAction = await dispatch(OlderMessageGet({ clubId: clubNumber, skip }));
        const olderMessages = olderMessagesAction.payload;
        if (olderMessages.length === 0) {
          setHasMore(false);
        } else {
          setMessages((prevMessages) => [...olderMessages.reverse(), ...prevMessages]);
          setSkip((prevSkip) => prevSkip + olderMessages.length);

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
    // 변수의 상태 확인
    console.log("소켓 상태:", socket);
    console.log("메시지 내용:", message.trim());
    console.log("이미지 파일:", imageFiles);
    console.log("클럽 번호:", clubNumber);
    console.log("유저 ID:", userId);

    // 메시지 전송 처리
    if (socket && (message.trim() || imageFiles.length > 0)) {
      const newMessage = {
        clubId: clubNumber, // 메시지 전송에 필요한 데이터
        senderId: userId,
        content: message.trim(),
        images: imageFiles,
      };

      // 메시지 전송
      socket.emit("message", newMessage);
      setMessage("");
      setImageFiles([]);
      setNewMessageReceived(true); // 메시지 전송 시에도 포커싱 처리
    } else {
      // 메시지 내용이 없거나 유효하지 않을 경우 스낵바 띄우기
      setSnackbarMessage("메시지 내용이 필요합니다."); // 원하는 에러 메시지
      setSnackbarSeverity("error"); // 오류로 설정
      setSnackbarOpen(true); // 스낵바 열기
      console.error("메시지 내용이 필요합니다.");
    }
  };

  // 엔터 키 입력 처리
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 이미지 업로드
  const handleFileUpload = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await axiosInstance.post("/clubs/chatimage/upload", formData);
      const imageUrls = res.data.urls;

      const newMessage = {
        clubId: clubNumber,
        senderId: userId,
        content: "",
        images: imageUrls,
      };

      socket.emit("message", newMessage);
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

  const handleSearch = (searchTerm) => {
    console.log("검색어:", searchTerm);
    setSearchTerm(searchTerm); // 검색어 상태 업데이트
  };

  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus(); // 텍스트 필드가 보일 때 포커스
    }
  }, [showSearchInput]);

  return (
    <Container
      maxWidth="md"
      sx={{
        marginBottom: 27,
        backgroundColor: "#ffffff",
        borderRadius: 7,
        paddingBottom: 7,
        paddingTop: 7,
        height: "118vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ChatHeader title={title} onFileUpload={handleFileUpload} setShowSearchInput={setShowSearchInput} />

      {showSearchInput && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm} // 검색어 상태 변경 함수 전달
          onSearch={handleSearch} // onSearch prop 전달
          inputRef={searchInputRef} // ref 전달
        />
      )}

      <Paper
        elevation={0}
        sx={{
          padding: 2,
          height: "calc(100% - 95px)",
          display: "flex",
          flexDirection: "column",
          marginBottom: 0,
          backgroundColor: "#D5D3CB",
          borderRadius: "0px 0px 0px 0px",
        }}
      >
        <MessageList messages={filteredMessages} userId={userId} handleScroll={handleScroll} isAtBottom={isAtBottom} onImageClick={handleImageClick} newMessageReceived={newMessageReceived} />
      </Paper>
      <MessageInput message={message} setMessage={setMessage} handleSendMessage={handleSendMessage} handleKeyPress={handleKeyPress} />
      <ImageModal open={isModalOpen} onClose={handleCloseModal} imageUrl={selectedImage} />
      {/* 커스텀 스낵바 컴포넌트 추가 */}
      <CustomSnackbarWithTimer
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // 원하는 위치로 변경
      />
    </Container>
  );
};

export default ChatPage;
