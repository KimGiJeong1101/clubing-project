import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import CKEditor5Editor from "../../components/club/ClubBoardRead";
import axios from "axios";

const EventDetail = ({ eventId, onClose }) => {
  const author = useSelector((state) => state.user?.userData?.user?.email || null);

  const fetchPost = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:4000/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("게시물 조회 오류:", error);
      throw error;
    }
  };

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchPost(eventId),
    onSuccess: (data) => {
      console.log("게시물 가져오기 성공:", data);
    },
    onError: (error) => {
      console.error("게시물 가져오기 오류:", error);
    },
  });

  const [isAuthor, setIsAuthor] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  useEffect(() => {
    if (post && post.writer === author) {
      setIsAuthor(true);
    } else {
      setIsAuthor(false);
    }
  }, [post, author]);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>게시물 가져오기 오류: {error.message}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다</div>;

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="bg-white pt-10 pb-10 max-w-[1000px] mx-auto px-4">
      {post && (
        <>
          {/* 상단 정보 */}
          <div className="border-b border-gray-300 pb-5 mb-5">
            <h2 className="text-xl font-bold mb-3">{post.title}</h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">작성자: {post.writer}</p>
                <p className="text-sm text-gray-500">조회수: {post.views}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">등록 날짜: {formatDateTime(post.createdAt)}</p>
                <p className="text-sm text-gray-500">
                  종료 날짜: {post.endTime ? formatDateTime(post.endTime) : "없음"}
                </p>
              </div>
            </div>
          </div>

          {/* CKEditor 내용 */}
          <div className="fetched-content pt-5">
            <CKEditor5Editor content={post.content} readOnly={true} />
          </div>
        </>
      )}

      {/* 스낵바 */}
      {snackbarOpen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000]">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg min-w-[280px] text-white ${
              snackbarSeverity === "success"
                ? "bg-green-600"
                : snackbarSeverity === "error"
                ? "bg-red-600"
                : "bg-yellow-500"
            }`}
          >
            <span className="flex-1 text-sm">{snackbarMessage}</span>
            <button
              onClick={handleSnackbarClose}
              className="hover:text-gray-200 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
