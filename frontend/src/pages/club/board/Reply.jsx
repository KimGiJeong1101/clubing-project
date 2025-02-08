import React, { useState } from "react";
import { Typography, TextField, IconButton, CircularProgress, Snackbar, Alert, Avatar, Button, Menu, MenuItem } from "@mui/material";
import { Box } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import InputAdornment from "@mui/material/InputAdornment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axios";
import moment from "moment";
import "moment/locale/ko"; // 한국어 locale 불러오기
import { useSelector } from "react-redux";
import MoreIcon from "@mui/icons-material/More";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null); // 선택한 댓글 저장
  const [selectedChildReply, setSelectedChildReply] = useState(null); // 선택한 대댓글 저장

  const queryClient = useQueryClient();
  const userNickName = useSelector((state) => state.user?.userData?.user?.nickName);

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

  // MoreIcon 버튼 클릭 시 메뉴 열기
  const handleMenuOpen = (event, reply, isChild = false) => {
    setAnchorEl(event.currentTarget);
    if (isChild) {
      setSelectedChildReply(reply); // 선택한 대댓글 저장
    } else {
      setSelectedReply(reply); // 선택한 댓글 저장
    }
  };

  // 메뉴 닫기
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReply(null); // 선택된 댓글 초기화
    setSelectedChildReply(null); // 선택된 대댓글 초기화
  };

  const handleDeleteReply = () => {
    if (selectedReply) {
      deleteMutation.mutate({
        replyId: selectedReply._id, // 삭제할 댓글의 ID
        writer: userNickName, // 현재 로그인한 사용자의 닉네임
      });
    } else if (selectedChildReply) {
      deleteMutation.mutate({
        replyId: selectedChildReply._id, // 삭제할 대댓글의 ID
        writer: userNickName, // 현재 로그인한 사용자의 닉네임
      });
    }
    handleMenuClose();
  };

  // 댓글 수정 시작 (수정 모드로 전환)
  const handleEditReply = () => {
    if (selectedReply && selectedReply.writerNickName === userNickName) {
      setEditMode(selectedReply._id); // 수정하려는 댓글의 ID 저장
      setEditComment(selectedReply.comment); // 기존 댓글을 수정 필드에 표시
    } else if (selectedChildReply && selectedChildReply.writerNickName === userNickName) {
      setEditChildMode(selectedChildReply._id); // 수정하려는 대댓글의 ID 저장
      setEditChildComment(selectedChildReply.comment); // 기존 대댓글을 수정 필드에 표시
    }
    handleMenuClose();
  };

  // 댓글 수정 제출
  const handleEditSubmit = () => {
    if (editComment.trim() === "") return;
    editMutation.mutate({
      replyId: editMode, // 수정할 댓글의 ID
      writer: userNickName,
      comment: editComment,
    });
  };

  // 대댓글 수정 제출
  const handleEditChildSubmit = () => {
    if (editChildComment.trim() === "") return;
    editMutation.mutate({
      replyId: editChildMode, // 수정할 대댓글의 ID
      writer: userNickName,
      comment: editChildComment,
    });
  };

  console.log("postType", postType);
  console.log("postId", postId);

  return (
    <Box
      sx={{
        height: "200px",
        maxHeight: "400px",
        p: 0.5,
        border: "1px solid grey",
        borderRadius: "8px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 1,
          position: "relative",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">{`Error: ${error.message}`}</Typography>
        ) : Array.isArray(replies) && replies.length > 0 ? (
          replies.map((reply, index) => (
            <Box key={index} sx={{ marginBottom: "2px" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Avatar src={reply.writerProfileImage || "default-profile.png"} alt={reply.writerNickName || "Unknown"} sx={{ width: 40, height: 40, marginRight: "16px" }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* 닉네임과 아이콘을 같은 라인에 배치 */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {reply.writerNickName || "Unknown"}
                      </Typography>
                      <IconButton
                        onClick={(event) => handleMenuOpen(event, reply)}
                        size="small"
                        sx={{ ml: 1 }} // 닉네임과 아이콘 간격 조정
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" sx={{ color: "gray" }}>
                      {moment(reply.createdAt).fromNow()}
                    </Typography>
                  </Box>

                  {editMode === reply._id ? (
                    // 수정 모드일 때는 수정 가능한 텍스트 필드 보여줌
                    <Box sx={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        multiline
                        minRows={1}
                        maxRows={4}
                        sx={{
                          "& .MuiInputBase-root": { paddingTop: "0px", paddingBottom: "0px", minHeight: "32px" },
                          "& .MuiOutlinedInput-input": { paddingTop: "4px", paddingBottom: "4px" },
                          "& .MuiOutlinedInput-root": { minHeight: "32px" },
                        }}
                      />
                      <IconButton color="primary" onClick={handleEditSubmit}>
                        <SendIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                      {reply.comment}
                    </Typography>
                  )}

                  {/* 대댓글 목록 */}
                  {reply.replies && reply.replies.length > 0 && (
                    <Box sx={{ marginLeft: "0px", marginTop: "8px" }}>
                      {reply.replies.map((childReply, childIndex) => (
                        <Box key={childIndex} sx={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                          <Avatar src={childReply.writerProfileImage || "default-profile.png"} alt={childReply.writerNickName || "Unknown"} sx={{ width: 30, height: 30, marginRight: "12px" }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              {/* 대댓글의 닉네임과 아이콘 배치 */}
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                  {childReply.writerNickName || "Unknown"}
                                </Typography>
                                <IconButton onClick={(event) => handleMenuOpen(event, childReply, true)} size="small" sx={{ ml: 1 }}>
                                  <MoreIcon />
                                </IconButton>
                              </Box>
                              <Typography variant="caption" sx={{ color: "gray" }}>
                                {moment(childReply.createdAt).fromNow()}
                              </Typography>
                            </Box>

                            {editChildMode === childReply._id ? (
                              // 대댓글 수정 모드일 때는 수정 가능한 텍스트 필드 보여줌
                              <Box sx={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  value={editChildComment}
                                  onChange={(e) => setEditChildComment(e.target.value)}
                                  multiline
                                  minRows={1}
                                  maxRows={4}
                                  sx={{
                                    "& .MuiInputBase-root": { paddingTop: "0px", paddingBottom: "0px", minHeight: "32px" },
                                    "& .MuiOutlinedInput-input": { paddingTop: "4px", paddingBottom: "4px" },
                                    "& .MuiOutlinedInput-root": { minHeight: "32px" },
                                  }}
                                />
                                <IconButton color="primary" onClick={handleEditChildSubmit}>
                                  <SendIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                                {childReply.comment}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Button variant="text" sx={{ marginTop: "2px" }} onClick={() => setActiveReplyIndex(index)}>
                    답글
                  </Button>

                  {activeReplyIndex === index && (
                    <Box sx={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="답글을 입력하세요"
                        value={replyContent}
                        onChange={handleReplyChange}
                        multiline
                        minRows={1}
                        maxRows={4}
                        sx={{
                          "& .MuiInputBase-root": { paddingTop: "0px", paddingBottom: "0px", minHeight: "32px" }, // 댓글 입력 칸과 동일한 스타일 적용
                          "& .MuiOutlinedInput-input": { paddingTop: "4px", paddingBottom: "4px" },
                          "& .MuiOutlinedInput-root": { minHeight: "32px" },
                        }}
                      />
                      <IconButton color="primary" onClick={() => handleReplySubmit(reply._id)}>
                        <SendIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No comments available</Typography>
        )}
      </Box>

      {/* 댓글의 MoreIcon 클릭 시 열리는 메뉴 */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditReply}>수정하기</MenuItem>
        <MenuItem onClick={handleDeleteReply}>삭제하기</MenuItem>
      </Menu>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="댓글을 입력하세요"
          value={comment}
          onChange={handleCommentChange}
          onKeyDown={handleKeyDown}
          multiline
          minRows={1}
          maxRows={10}
          sx={{
            mb: 1,
            "& .MuiInputBase-root": { paddingTop: "0px", paddingBottom: "0px", minHeight: "32px" },
            "& .MuiOutlinedInput-input": { paddingTop: "4px", paddingBottom: "4px" },
            "& .MuiOutlinedInput-root": { minHeight: "32px" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="primary" onClick={handleCommentSubmit} sx={{ padding: "4px" }}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reply;
