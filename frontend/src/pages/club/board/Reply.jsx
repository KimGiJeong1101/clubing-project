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
  const [editMode, setEditMode] = useState(null); // 수정 모드 상태 (null이면 수정모드 아님, reply ID를 가짐)
  const [editComment, setEditComment] = useState(""); // 수정할 댓글 상태
  const [editChildMode, setEditChildMode] = useState(null); // 대댓글 수정 모드
  const [editChildComment, setEditChildComment] = useState(""); // 수정할 대댓글 상태
  const [activeReplyIndex, setActiveReplyIndex] = useState(null); // 현재 활성화된 답글 입력창을 위한 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success', 'error'

  // Menu 상태 관리
  const [menuOpenId, setMenuOpenId] = useState(null); // 열린 메뉴 ID (댓글 또는 대댓글 _id)
  const [selectedReply, setSelectedReply] = useState(null); // 선택한 댓글 저장
  const [selectedChildReply, setSelectedChildReply] = useState(null); // 선택한 대댓글 저장
  const menuRef = useRef(null);

  const queryClient = useQueryClient();
  const userNickName = useSelector((state) => state.user?.userData?.user?.nickName);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
        setSelectedReply(null);
        setSelectedChildReply(null);
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
      const response = await axiosInstance.get(`http://localhost:4000/replies/board/${postId}`);
      return response.data.replies; // replies 배열만 반환
    },
    retry: 3,
  });

  // 댓글/대댓글 등록
  const mutation = useMutation({
    mutationFn: (newComment) => {
      return axiosInstance.post(`http://localhost:4000/replies/board/add/${newComment.postId}`, newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["replies", postType, postId]);
      setComment("");
      setReplyContent("");
      handleSnackbarOpen("댓글이 성공적으로 등록되었습니다.", "success");
    },
    onError: (error) => {
      handleSnackbarOpen(`댓글 등록 중 에러 발생: ${error.message}`, "error");
    },
  });

  // 댓글 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: ({ replyId, writer }) => {
      return axiosInstance.delete(`http://localhost:4000/replies/board/delete/${replyId}`, {
        data: { writer }, // 삭제 요청 시 삭제하는 사용자의 정보를 함께 보냄
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["replies", postType, postId]); // 댓글 목록을 다시 가져옴
      handleSnackbarOpen("댓글이 성공적으로 삭제되었습니다.", "success");
    },
    onError: (error) => {
      handleSnackbarOpen(`댓글 삭제 중 에러 발생: ${error.message}`, "error");
    },
  });

  // 댓글 수정 Mutation
  const editMutation = useMutation({
    mutationFn: ({ replyId, writer, comment }) => {
      return axiosInstance.put(`http://localhost:4000/replies/board/edit/${replyId}`, {
        writer,
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["replies", postType, postId]); // 댓글 목록을 다시 가져옴
      handleSnackbarOpen("댓글이 성공적으로 수정되었습니다.", "success");
      setEditMode(null); // 수정 모드를 종료
      setEditComment("");
      setEditChildMode(null); // 대댓글 수정 모드 종료
      setEditChildComment("");
    },
    onError: (error) => {
      handleSnackbarOpen(`댓글 수정 중 에러 발생: ${error.message}`, "error");
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
      handleCommentSubmit(); // 댓글 제출
    }
  };

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (comment.trim() === "") return;
    mutation.mutate({
      postType,
      postId,
      writer: userNickName,
      comment,
    });
  };

  // 대댓글 등록
  const handleReplySubmit = (parentReplyId) => {
    if (replyContent.trim() === "") return;
    mutation.mutate({
      postType,
      postId,
      writer: userNickName,
      comment: replyContent,
      parentReplyId, // 부모 댓글의 ID를 전달
    });
    setActiveReplyIndex(null); // 답글 입력 후 입력창 닫기
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // More 버튼 클릭 시 메뉴 열기
  const handleMenuOpen = (id, reply, isChild = false) => {
    setMenuOpenId(id);
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
    setMenuOpenId(null);
    setSelectedReply(null);
    setSelectedChildReply(null);
  };

  const handleDeleteReply = () => {
    if (selectedReply) {
      deleteMutation.mutate({
        replyId: selectedReply._id,
        writer: userNickName,
      });
    } else if (selectedChildReply) {
      deleteMutation.mutate({
        replyId: selectedChildReply._id,
        writer: userNickName,
      });
    }
    handleMenuClose();
  };

  // 댓글 수정 시작 (수정 모드로 전환)
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
    editMutation.mutate({
      replyId: editMode,
      writer: userNickName,
      comment: editComment,
    });
  };

  // 대댓글 수정 제출
  const handleEditChildSubmit = () => {
    if (editChildComment.trim() === "") return;
    editMutation.mutate({
      replyId: editChildMode,
      writer: userNickName,
      comment: editChildComment,
    });
  };

  console.log("postType", postType);
  console.log("postId", postId);

  return (
    <div className="h-[200px] max-h-[400px] p-1 border border-gray-400 rounded-lg flex flex-col flex-grow">
      {/* 댓글 목록 */}
      <div className="flex-1 overflow-y-auto mb-2 relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#A67153] rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <p className="text-red-500 text-sm">Error: {error.message}</p>
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
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    {/* 닉네임 + more 버튼 */}
                    <div className="flex items-center relative" ref={menuOpenId === reply._id ? menuRef : null}>
                      <span className="font-bold text-sm">{reply.writerNickName || "Unknown"}</span>
                      <button
                        onClick={() => handleMenuOpen(reply._id, reply)}
                        className="ml-1 p-1 rounded hover:bg-gray-100 text-gray-500"
                      >
                        <FiMoreHorizontal size={16} />
                      </button>
                      {/* 드롭다운 메뉴 */}
                      {menuOpenId === reply._id && selectedReply && (
                        <div className="absolute left-0 top-7 z-50 bg-white border border-gray-200 rounded shadow-md min-w-[100px]">
                          <button
                            onClick={handleEditReply}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            수정하기
                          </button>
                          <button
                            onClick={handleDeleteReply}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
                          >
                            삭제하기
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{moment(reply.createdAt).fromNow()}</span>
                  </div>

                  {editMode === reply._id ? (
                    <div className="flex items-center mt-2">
                      <textarea
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:ring-1 focus:ring-primary-200"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={1}
                      />
                      <button onClick={handleEditSubmit} className="ml-1 p-1 text-blue-500 hover:text-blue-700">
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
                            className="w-7 h-7 rounded-full object-cover mr-3 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div
                                className="flex items-center relative"
                                ref={menuOpenId === childReply._id ? menuRef : null}
                              >
                                <span className="font-bold text-xs">{childReply.writerNickName || "Unknown"}</span>
                                <button
                                  onClick={() => handleMenuOpen(childReply._id, childReply, true)}
                                  className="ml-1 p-0.5 rounded hover:bg-gray-100 text-gray-500"
                                >
                                  <FiMoreHorizontal size={14} />
                                </button>
                                {/* 드롭다운 메뉴 */}
                                {menuOpenId === childReply._id && selectedChildReply && (
                                  <div className="absolute left-0 top-6 z-50 bg-white border border-gray-200 rounded shadow-md min-w-[100px]">
                                    <button
                                      onClick={handleEditReply}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                    >
                                      수정하기
                                    </button>
                                    <button
                                      onClick={handleDeleteReply}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
                                    >
                                      삭제하기
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{moment(childReply.createdAt).fromNow()}</span>
                            </div>

                            {editChildMode === childReply._id ? (
                              <div className="flex items-center mt-2">
                                <textarea
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:ring-1 focus:ring-primary-200"
                                  value={editChildComment}
                                  onChange={(e) => setEditChildComment(e.target.value)}
                                  rows={1}
                                />
                                <button onClick={handleEditChildSubmit} className="ml-1 p-1 text-blue-500 hover:text-blue-700">
                                  <FiSend size={16} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs break-words whitespace-pre-wrap">{childReply.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveReplyIndex(index)}
                    className="text-xs text-blue-500 hover:underline mt-0.5"
                  >
                    답글
                  </button>

                  {activeReplyIndex === index && (
                    <div className="flex items-center mt-2">
                      <textarea
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] focus:outline-none focus:ring-1 focus:ring-primary-200"
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

      {/* 댓글 입력 */}
      <div className="flex items-center">
        <textarea
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[32px] max-h-[160px] focus:outline-none focus:ring-1 focus:ring-primary-200 mb-1"
          placeholder="댓글을 입력하세요"
          value={comment}
          onChange={handleCommentChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          onClick={handleCommentSubmit}
          className="ml-1 p-1 text-blue-500 hover:text-blue-700"
        >
          <FiSend size={16} />
        </button>
      </div>

      {/* 스낵바 */}
      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[400]">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
              snackbarSeverity === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <span>{snackbarMessage}</span>
            <button onClick={handleSnackbarClose} className="ml-2 hover:opacity-80">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reply;
