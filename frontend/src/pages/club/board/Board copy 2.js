//api 분리 전 백업
import React, { useState, useEffect } from "react";
import { Container, Typography, Fab, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CKEditor5Editor from "../../../components/club/ClubBoardEditor";
import VoteCreationForm from "../../../components/club/ClubVote";
import ListPosts from "./BoardList";
import axiosInstance from "./../../../utils/axios";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Board = () => {
  const [open, setOpen] = useState(false);
  const [editorData, setEditorData] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [showPost, setShowPost] = useState(false);
  const [showList, setShowList] = useState(true);
  const [image, setImage] = useState("");

  // 투표 관련 상태
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [endTime, setEndTime] = useState("");

  // 회원 여부 상태
  const [isMember, setIsMember] = useState(false);

  // Snackbar 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");
  const author = useSelector((state) => state.user?.userData?.user?.email || null);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const response = await axiosInstance.get("http://localhost:4000/clubs/boards/membership", {
          params: { clubNumber, email: author },
        });
        setIsMember(response.data.isMember);
      } catch (error) {
        console.error("회원 여부 확인 오류:", error);
      }
    };

    if (author && clubNumber) {
      checkMembership();
    }
  }, [author, clubNumber]);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!title) {
      showSnackbar("제목을 입력해주세요.", "error");
      return;
    }
    if (!category) {
      showSnackbar("카테고리를 입력해주세요.", "error");
      return;
    }
    if (!editorData) {
      showSnackbar("내용을 입력해주세요.", "error");
      return;
    }
    try {
      await axiosInstance.post("http://localhost:4000/clubs/boards/posts", {
        clubNumber,
        create_at: getCurrentDate(),
        author,
        title,
        category,
        content: editorData,
      });
      handleClose();
    } catch (error) {
      if (error.response) {
        showSnackbar(error.response.data.error, "error");
      } else {
        showSnackbar("서버와의 연결에 문제가 발생했습니다.", "error");
      }
      console.error("게시글 작성에 오류: 항목 확인해주세요", error.message);
    }
  };

  const handleVoteSave = async () => {
    if (!title) {
      showSnackbar("제목을 입력해주세요.", "error");
      return;
    }
    if (!category) {
      showSnackbar("카테고리를 입력해주세요.", "error");
      return;
    }
    if (options.some((option) => !option.trim())) {
      showSnackbar("모든 항목을 입력해주세요.", "error");
      return;
    }
    if (!endTime) {
      showSnackbar("종료 시간을 입력해주세요.", "error");
      return;
    }
    try {
      await axiosInstance.post("http://localhost:4000/clubs/boards/votes", {
        clubNumber,
        create_at: getCurrentDate(),
        author,
        title,
        category,
        options,
        allowMultiple,
        anonymous,
        endTime,
      });
      handleClose();
    } catch (error) {
      showSnackbar("투표 작성 오류: 항목을 확인해주세요", "error");
      console.error("투표 저장 오류:", error.message);
    }
  };

  const handleEditorChange = (data) => {
    setEditorData(data);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setShowList(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowList(true);
    if (category === "투표") {
      resetVoteState();
    } else {
      resetEditorState();
    }
  };

  const resetEditorState = () => {
    setTitle("");
    setCategory("");
    setEditorData("");
  };

  const resetVoteState = () => {
    setTitle("");
    setCategory("");
    setOptions([""]);
    setAllowMultiple(false);
    setAnonymous(false);
    setEndTime("");
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      {isMember && (
        <Fab
          onClick={handleClickOpen}
          color="primary"
          aria-label="add"
          style={{
            position: "fixed",
            bottom: "50px",
            right: "50px",
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {showList && <ListPosts />}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>글쓰기</DialogTitle>
        <DialogContent>
          {category === "투표" ? <VoteCreationForm title={title} setTitle={setTitle} category={category} setCategory={setCategory} options={options} setOptions={setOptions} allowMultiple={allowMultiple} setAllowMultiple={setAllowMultiple} anonymous={anonymous} setAnonymous={setAnonymous} endTime={endTime} setEndTime={setEndTime} /> : <CKEditor5Editor onChange={handleEditorChange} title={title} setTitle={setTitle} category={category} setCategory={setCategory} setImage={setImage} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
          {category === "투표" ? (
            <Button onClick={handleVoteSave} color="primary">
              저장
            </Button>
          ) : (
            <Button onClick={handleSave} color="primary">
              저장
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} message={snackbarMessage} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Board;
