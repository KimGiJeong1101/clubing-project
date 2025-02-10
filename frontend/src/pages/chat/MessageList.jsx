import React, { useRef, useEffect, useState } from "react";
import { Grid, Typography, Box, Modal, IconButton } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import CloseIcon from "@mui/icons-material/Close";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axiosInstance from "../../utils/axios";

// 시간 형식 변환 함수
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const adjustedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${ampm} ${adjustedHours}:${formattedMinutes}`;
};

// 메시지 날짜별 그룹화
const groupMessagesByDate = (messages) => {
  return messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});
};

// 사용자 정보 가져오기
const fetchUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { name: "Unknown", profilePic: "" }; // 프로필 사진 기본값 추가
  }
};

// 이모지 체크 함수
const isEmoji = (char) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F004}-\u{1F0CF}]/u;
  return emojiRegex.test(char);
};

// 이모지로만 이루어진지 체크
const isOnlyEmoji = (text) => {
  const cleanedText = text.replace(/\s/g, ""); // 공백 제거
  return [...cleanedText].every(isEmoji); // 모든 문자가 이모지인지 확인
};

// 이모지 개수 카운트
const countEmojis = (text) => {
  return [...text].filter(isEmoji).length;
};

// 이미지 크기 반환 함수
const getImageSize = (count) => {
  switch (count) {
    case 1:
      return { width: 150, height: 150 }; // 이미지가 한 장일 때
    case 2:
      return { width: 125, height: 125 }; // 이미지가 두 장일 때
    case 3:
      return { width: 105, height: 105 }; // 이미지가 세 장일 때
    case 4:
      return { width: 100, height: 100 }; // 이미지가 네 장일 때
    default:
      return { width: 100, height: 100 }; // 이미지가 네 장 이상일 때
  }
};

const isUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/;
  return urlRegex.test(text);
};

const MessageList = ({ messages, userId, handleScroll, isAtBottom, newMessageReceived }) => {
  const containerRef = useRef(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [open, setOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);

  // 현재 로그인된 사용자 데이터
  const userData = useSelector((state) => state.user.userData.user);
  const username = userData.name;

  // 이미지 클릭 핸들러
  const handleImageClick = (images, index) => {
    setCurrentImages(images);
    setInitialIndex(index);
    setOpen(true);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setOpen(false);
    setCurrentImages([]);
    setInitialIndex(0);
  };

  // 사용자 정보를 비동기적으로 가져오는 함수
  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueUserIds = [...new Set(messages.map((msg) => msg.sender)), userId];
      const userData = await Promise.all(uniqueUserIds.map(fetchUserById));

      const userMap = uniqueUserIds.reduce((acc, id, index) => {
        acc[id] = userData[index];
        return acc;
      }, {});

      setUserProfiles(userMap);
    };

    fetchUsers();
  }, [messages, userId]);

  // 스크롤 위치 업데이트
  useEffect(() => {
    if (isAtBottom && newMessageReceived) {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isAtBottom, newMessageReceived]);

  // 날짜별로 그룹화된 메시지
  const groupedMessages = groupMessagesByDate(messages);

  // 가장 최근 메시지의 ref
  const latestMessageRef = useRef(null);

  // 메시지를 전송한 후 최신 메시지로 스크롤
  const scrollToLatestMessage = () => {
    const container = containerRef.current;
    if (latestMessageRef.current && container) {
      container.scrollTo({
        top: latestMessageRef.current.offsetTop,
        behavior: "auto",
      });
    }
  };

  useEffect(() => {
    scrollToLatestMessage();
  }, [messages]);

  return (
    <Box
      className="custom-scrollbar" // 스크롤바 커스터마이징 클래스 추가
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: "#D5D3CB",
        padding: 2,
        position: "relative",
      }}
      ref={containerRef}
      onScroll={handleScroll}
    >
      {Object.keys(groupedMessages).map((date, dateIndex) => (
        <Box key={dateIndex} sx={{ marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // 수평 가운데 정렬
              marginBottom: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#212121",
                opacity: 0.4,
                borderRadius: "15px",
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "45%",
                margin: "6px 0",
              }}
            >
              <Typography variant="caption" sx={{ color: "#ffffff", margin: 0, opacity: 1 }}>
                {date}
              </Typography>
            </Box>
          </Box>
          {groupedMessages[date].map((msg, index) => (
            <Grid container key={msg._id || index} sx={{ marginBottom: 1 }} justifyContent={msg.sender === userId ? "flex-end" : "flex-start"} alignItems="flex-start">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                  position: "relative",
                }}
              >
                {/* 사용자 이름과 프로필 사진을 메시지 위에 배치 */}
                {msg.sender !== userId && (
                  <Box sx={{ display: "flex", alignItems: "flex-end", marginBottom: "4px" }}>
                    <img
                      src={userProfiles[msg.sender]?.profilePic || ""} // 프로필 사진 표시
                      alt="Profile"
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                        marginRight: "6px",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.85rem",
                        color: "#000000",
                      }}
                    >
                      {userProfiles[msg.sender]?.nickName || "Unknown"}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end", // 시간 표시를 하단에 정렬
                    flexDirection: msg.sender === userId ? "row-reverse" : "row",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1, // 채팅 내용이 가능한 한 많은 공간을 차지하도록 설정
                      backgroundColor: msg.sender === userId ? "rgba(186, 153, 135, 0.8)" : "#F2F2F2",
                      color: msg.sender === userId ? "#202020" : "#202020",
                      borderRadius: "10px",
                      padding: "6px 9px 6px 9px", // 상단, 우측, 하단, 좌측
                      marginLeft: msg.sender === userId ? "0px" : "22px",
                    }}
                  >
                    {/* 이모지 크기 조건에 따른 처리 */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: isOnlyEmoji(msg.content) && countEmojis(msg.content) === 1 ? "2.5rem" : "1rem",
                      }}
                    >
                      {isUrl(msg.content) ? (
                        <a
                          href={msg.content.startsWith("http") ? msg.content : `http://${msg.content}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#1976d2",
                            textDecoration: "underline", // 밑줄 추가
                            textUnderlineOffset: "4px", // 밑줄과 글자 간격 설정
                            textDecorationThickness: "1px", // 밑줄 두께 조정 (선택 사항)
                          }}
                        >
                          {msg.content}
                        </a>
                      ) : (
                        msg.content
                      )}
                    </Typography>

                    {msg.images && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {msg.images.map((image, i) => {
                          const { width, height } = getImageSize(msg.images.length); // 이미지 개수에 따른 크기 결정
                          return (
                            <Box key={i} sx={{ flex: `0 0 ${width}px`, height: `${height}px` }}>
                              <img
                                src={image.thumbnail}
                                alt={`image-${i}`}
                                onClick={() => handleImageClick(msg.images, i)}
                                style={{
                                  width: "100%", // 박스에 맞게 너비 설정
                                  height: "100%", // 박스에 맞게 높이 설정
                                  objectFit: "cover", // 비율 유지하면서 박스에 맞게 조정
                                  cursor: "pointer",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  {/* 시간 표시를 채팅 내용과 다른 공간에 배치 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end", // 시간 표시를 하단에 정렬
                      ...(msg.sender === userId ? { marginRight: "8px" } : { marginLeft: "8px" }),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        color: "#000000",
                        whiteSpace: "nowrap", // 공백을 무시하고 한 줄로 표시
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
          {/* 가장 최근 메시지를 참조하는 요소 */}
          <div ref={latestMessageRef} />
        </Box>
      ))}

      {/* 이미지 모달 */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "none",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            backgroundColor: "transparent",
            padding: 0,
            border: "none",
            boxShadow: "none",
          }}
        >
          <Slider initialSlide={initialIndex} infinite={false}>
            {currentImages.map((image, i) => (
              <Box key={i} sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <img
                  src={image.original}
                  alt={`Full size ${i}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "80vh",
                    objectFit: "contain",
                    border: "none",
                    outline: "none",
                  }}
                />
              </Box>
            ))}
          </Slider>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
    </Box>
  );
};

export default MessageList;
