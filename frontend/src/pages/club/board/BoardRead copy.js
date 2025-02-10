//api 분리 전
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import CKEditor5Editor from "../../../components/club/ClubBoardRead";
import UpdatePost from "../../../components/club/ClubBoardUpdateEditor";
import { usePost } from "../../../hooks/usePost";
import { useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ChatIcon from "@mui/icons-material/Chat";

const Read = ({ postId, onClose }) => {
  const queryClient = useQueryClient();
  const { data: post, isLoading, error } = usePost(postId);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const author = useSelector((state) => state.user?.userData?.user?.email || null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || "");
      setIsAuthor(post.author === author);
    } else {
      setTitle("");
      setCategory("");
      setContent("");
      setImage("");
      setIsAuthor(false);
    }
  }, [post, author]);

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`http://localhost:4000/clubs/boards/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      axios.put(`http://localhost:4000/clubs/boards/posts/${postId}`, {
        title,
        category,
        content,
        image,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setOpenEditModal(false);
      onClose();
    },
    onError: (error) => {
      console.error("Error updating post:", error);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleSave = () => {
    if (!title) {
      showSnackbar("제목이 없습니다.", "error");
      return;
    }
    if (!content) {
      showSnackbar("내용이 없습니다.", "error");
      return;
    }
    updateMutation.mutate();
  };

  const handleOpenEditModal = () => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || "");
    }
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching post: {error.message}</p>;
  if (!post) return <p>No post found</p>;

  return (
    <Container>
      {post && (
        <>
          <div className="fetched-content">
            <CKEditor5Editor content={post.content} readOnly={true} />
          </div>
          {isAuthor && (
            <Box
              mt={2}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Distribute space between items
                width: "100%", // Ensure full width
              }}
            >
              <ChatIcon
                sx={{
                  color: "#999999",
                  fontSize: "40px",
                  flexShrink: 0, // Prevent the icon from shrinking
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#DBC7B5",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#A67153",
                    },
                  }}
                  onClick={handleOpenEditModal}
                >
                  수정
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#6E3C21",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#A67153",
                    },
                  }}
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="md">
        <DialogTitle>게시물 수정</DialogTitle>
        <DialogContent>
          <UpdatePost post={{ title, category, content, image }} onChange={(data) => setContent(data)} title={title} setTitle={setTitle} category={category} setCategory={setCategory} content={content} setImage={setImage} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            닫기
          </Button>
          <Button onClick={handleSave} color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Read;
