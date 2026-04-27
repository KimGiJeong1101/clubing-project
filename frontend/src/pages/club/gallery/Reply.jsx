import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiMoreHorizontal } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axios";
import moment from "moment";
import "moment/locale/ko"; // 한국어 locale 불러오기
import { useSelector } from "react-redux";

// moment의 locale을 한국어로 설정
moment.locale("ko");

const Reply = ({ postType, postId }) => {
  const [comment, setComment] = useState("");
  const [replyContent, setReplyContent] = useState(""); // 답글 입력값 상태
  const [editMode, setEditMode] = useState(null); // 수정 모드 상태
  const [editComment, setEditComment] = useState(""); // 수정할 댓글 상태
  const [editChildMode, setEditChildMode] = useState(null); // 대댓글 수정 모드
  const [editChildComment, setEditChildComment] = useState(""); // 수정할 대댓글 상태
  const [activeReplyIndex, setActiveReplyIndex] = useState(null); // 현재 활성화된 답글 입력창
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // 드롭다운 메뉴 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedReply, setSelectedReply] = useState(null);
  const [selectedChildReply, setSelectedChildReply] = useState(null);
  const menuRef = useRef(null);

  const queryClient = useQueryClient();
  const userNickName = useSelector((state) => state.user?.userData?.user?.nickName);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 댓글 및 대댓글 목록 가져오기
  const {
    data: replies,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["replies", postType, postId],
    queryFn: async () => {
      const response = await axiosInstance.get(`http://localhost:4000/replies/${postId}`);
      return response.data.replies;
    },
    retry: 3,
  });

  // 댓글/대댓글 등록
  const mutation = useMutation({
    mutationFn: (newComment) => {
      return axiosInstance.post(`http://localhost:4000/replies/add/${newComment.postId}`, newComment);
    },
  });

  // 댓글 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: ({ replyId, writer }) => {
      return axiosInstance.delete(`http://localhost:4000/replies/delete/${replyId}`, {
        data: { writer },
      });
    },
  });

  // 댓글 수정 Mutation
  const editMutation = useMutation({
    mutationFn: ({ replyId, writer, comment }) => {
      return axiosInstance.put(`http://localhost:4000/replies/edit/${replyId}`, {
        writer,
        comment,
      });
    },
  });

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (comment.trim() === "") return;

    mutation.mutate(
      { postType, postId, writer: userNickName, comment },
      {
        onSettled: (data, error) => {
          if (!error) {
            queryClient.invalidateQueries(["replies", postType, postId]);
            setComment("");
            setReplyContent("");
            handleSnackbarOpen("댓글이 성공적으로 등록되었습니다.", "success");
          } else {
            handleSnackbarOpen(`댓글 등록 중 에러 발생: ${error.message}`, "error");
          }
        },
      },
    );
  };

  // 대댓글 등록
  const handleReplySubmit = (parentReplyId) => {
    if (replyContent.trim() === "") return;

    mutation.mutate(
      { postType, postId, writer: userNickName, comment: replyContent, parentReplyId },
      {
        onSettled: (data, error) => {
          if (!error) {
            queryClient.invalidateQueries(["replies", postType, postId]);
            setActiveReplyIndex(null);
            handleSnackbarOpen("답글이 성공적으로 등록되었습니다.", "success");
          } else {
            handleSnackbarOpen(`답글 등록 중 에러 발생: ${error.message}`, "error");
          }
        },
      },
    );
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 4000);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // MoreIcon 버튼 클릭 시 메뉴 열기
  const handleMenuOpen = (event, reply, isChild = false) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setMenuOpen(true);
    if (isChild) {
      setSelectedChildReply(reply);
      setSelectedReply(null);
    } else {
      setSelectedReply(reply);
      setSelectedChildReply(null);
    }
  };

  // 메뉴 닫기
  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedReply(null);
    setSelectedChildReply(null);
  };

  const handleDeleteReply = () => {
    const selected = selectedReply ? selectedReply : selectedChildReply;
    if (!selected) return;

    deleteMutation.mutate(
      { replyId: selected._id, writer: userNickName },
      {
        onSettled: (data, error) => {
          if (!error) {
            queryClient.invalidateQueries(["replies", postType, postId]);
            handleSnackbarOpen("댓글이 성공적으로 삭제되었습니다.", "success");
          } else {
            handleSnackbarOpen(`댓글 삭제 중 에러 발생: ${error.message}`, "error");
          }
        },
      },
    );
    handleMenuClose();
  };

  // 댓글 수정 시작
  const handleEditReply = () => {
    if (selectedReply && selectedReply.writerNickName === userNickName) {
      setEditMode(selectedReply._id);
      setEditComment(selectedReply.comment);
    } else if (selectedChildReply && selectedChildReply.writerNickName === userNickName) {
      setEditChildMode(selectedChildReply._id);
      setEditChildComment(selectedChildReply.comment);
    }
    handleMenuClose();
  };

  // 댓글 수정 제출
  const handleEditSubmit = () => {
    if (editComment.trim() === "") return;

    editMutation.mutate(
      { replyId: editMode, writer: userNickName, comment: editComment },
      {
        onSettled: (data, error) => {
          if (!error) {
            queryClient.invalidateQueries(["replies", postType, postId]);
            setEditMode(null);
            setEditComment("");
            handleSnackbarOpen("댓글이 성공적으로 수정되었습니다.", "success");
          } else {
            handleSnackbarOpen(`댓글 수정 중 에러 발생: ${error.message}`, "error");
          }
        },
      },
    );
  };

  // 대댓글 수정 제출
  const handleEditChildSubmit = () => {
    if (editChildComment.trim() === "") return;

    editMutation.mutate(
      { replyId: editChildMode, writer: userNickName, comment: editChildComment },
      {
        onSettled: (data, error) => {
          if (!error) {
            queryClient.invalidateQueries(["replies", postType, postId]);
            setEditChildMode(null);
            setEditChildComment("");
            handleSnackbarOpen("대댓글이 성공적으로 수정되었습니다.", "success");
          } else {
            handleSnackbarOpen(`대댓글 수정 중 에러 발생: ${error.message}`, "error");
          }
        },
      },
    );
  };

  return (
    <div className="h-[200px] max-h-[400px] p-1 border border-gray-400 rounded-lg flex-grow flex flex-col">
      {/* 댓글 목록 */}
      <div className="flex-grow overflow-y-auto mb-2 relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-red-500">{`Error: ${error.message}`}</p>
        ) : Array.isArray(replies) && replies.length > 0 ? (
          replies.map((reply, index) => (
            <div key={index} className="mb-0.5">
              <div className="flex items-start">
                {/* 아바타 */}
                <img
                  src={reply.writerProfileImage || "default-profile.png"}
                  alt={reply.writerNickName || "Unknown"}
                  className="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-bold text-sm">{reply.writerNickName || "Unknown"}</span>
                      <button
                        onClick={(event) => handleMenuOpen(event, reply)}
                        className="ml-1 p-1 text-gray-500 hover:text-gray-700 rounded"
                      >
                        <FiMoreHorizontal size={16} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">{moment(reply.createdAt).fromNow()}</span>
                  </div>

                  {editMode === reply._id ? (
                    <div className="flex items-center mt-2">
                      <textarea
                        className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:border-blue-400"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={1}
                      />
                      <button
                        onClick={handleEditSubmit}
                        className="ml-1 p-1 text-blue-500 hover:text-blue-700"
                      >
                        <FiSend size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap">{reply.comment}</p>
                  )}

                  {/* 대댓글 목록 */}
                  {reply.replies && reply.replies.length > 0 && (
                    <div className="mt-2">
                      {reply.replies.map((childReply, childIndex) => (
                        <div key={childIndex} className="flex items-start mb-2">
                          <img
                            src={childReply.writerProfileImage || "default-profile.png"}
                            alt={childReply.writerNickName || "Unknown"}
                            className="w-[30px] h-[30px] rounded-full object-cover mr-3 flex-shrink-0"
                          />
                          <div className="flex-grow">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="font-bold text-xs">{childReply.writerNickName || "Unknown"}</span>
                                <button
                                  onClick={(event) => handleMenuOpen(event, childReply, true)}
                                  className="ml-1 p-1 text-gray-500 hover:text-gray-700 rounded"
                                >
                                  <FiMoreHorizontal size={14} />
                                </button>
                              </div>
                              <span className="text-xs text-gray-400">{moment(childReply.createdAt).fromNow()}</span>
                            </div>

                            {editChildMode === childReply._id ? (
                              <div className="flex items-center mt-2">
                                <textarea
                                  className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:border-blue-400"
                                  value={editChildComment}
                                  onChange={(e) => setEditChildComment(e.target.value)}
                                  rows={1}
                                />
                                <button
                                  onClick={handleEditChildSubmit}
                                  className="ml-1 p-1 text-blue-500 hover:text-blue-700"
                                >
                                  <FiSend size={16} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm break-words whitespace-pre-wrap">{childReply.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="text-xs text-primary-500 mt-0.5 hover:underline"
                    onClick={() => setActiveReplyIndex(index)}
                  >
                    답글
                  </button>

                  {activeReplyIndex === index && (
                    <div className="flex items-center mt-2">
                      <textarea
                        className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:border-blue-400"
                        placeholder="답글을 입력하세요"
                        value={replyContent}
                        onChange={handleReplyChange}
                        rows={1}
                      />
                      <button
                        onClick={() => handleReplySubmit(reply._id)}
                        className="ml-1 p-1 text-blue-500 hover:text-blue-700"
                      >
                        <FiSend size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments available</p>
        )}
      </div>

      {/* 드롭다운 메뉴 (portal 대신 fixed 포지셔닝) */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            onClick={handleEditReply}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            수정하기
          </button>
          <button
            onClick={handleDeleteReply}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            삭제하기
          </button>
        </div>
      )}

      {/* 댓글 입력창 */}
      <div className="flex items-center">
        <div className="flex-grow relative">
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:border-blue-400 pr-10"
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleCommentSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 p-1"
          >
            <FiSend size={14} />
          </button>
        </div>
      </div>

      {/* Snackbar */}
      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded shadow-lg text-white ${
              snackbarSeverity === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <span>{snackbarMessage}</span>
            <button onClick={handleSnackbarClose} className="ml-2 font-bold text-white hover:opacity-75">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reply;
