import React, { useState, useEffect } from 'react';
import { Container, Fab, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Box } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import CKEditor5Editor from '../../../components/club/ClubBoardEditor';
import VoteCreationForm from '../../../components/club/ClubVote';
import ListPosts from './BoardList';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { checkMembership, savePost, saveVote } from '../../../api/ClubBoardApi';

const Board = () => {
  const [open, setOpen] = useState(false);
  const [editorData, setEditorData] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [endTime, setEndTime] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");
  const author = useSelector(state => state.user?.userData?.user?.email || null);

  useEffect(() => {
    if (author && clubNumber) {
      checkMembership(clubNumber, author)
        .then(setIsMember)
        .catch(() => setIsMember(false));
    }
  }, [author, clubNumber]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!title || !category || !editorData) {
      showSnackbar('모든 필드를 입력해주세요.', 'error');
      return;
    }
    try {
      await savePost({
        clubNumber,
        create_at: getCurrentDate(),
        author,
        title,
        category,
        content: editorData
      });
      handleClose();
    } catch {
      showSnackbar('게시글 저장에 실패했습니다.', 'error');
    }
  };

  const handleVoteSave = async () => {
    if (!title || !category || options.some(option => !option.trim()) || !endTime) {
      showSnackbar('모든 필드를 입력해주세요.', 'error');
      return;
    }
    try {
      await saveVote({
        clubNumber,
        create_at: getCurrentDate(),
        author,
        title,
        category,
        options,
        allowMultiple,
        anonymous,
        endTime
      });
      handleClose();
    } catch {
      showSnackbar('투표 저장에 실패했습니다.', 'error');
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    category === '투표' ? resetVoteState() : resetEditorState();
  };

  const resetEditorState = () => {
    setTitle('');
    setCategory('');
    setEditorData('');
  };

  const resetVoteState = () => {
    setTitle('');
    setCategory('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setAnonymous(false);
    setEndTime('');
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
    <Container >
      {isMember && (
        <Fab
          onClick={handleClickOpen}
          aria-label="add"
          sx={{ 
                backgroundColor: "#DBC7B5",
                color: "white",
                position: "fixed",
                bottom: "50px",
                right: "100px",
                "&:hover": {
                  backgroundColor: "#A67153", // hover 시 배경 색상 변경
                },
              }}
        >
          <AddIcon />
        </Fab>
      )}

      <ListPosts />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            height: '80%', // 전체 높이를 80%로 설정
            maxHeight: '80%', // 최대 높이 설정
          },
        }}
      >
        <DialogTitle>글쓰기</DialogTitle>
        <DialogContent
          dividers // 내용에 구분선 추가
          sx={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }} // 내용 영역의 최대 높이 설정
        >
          {category === '투표' ? (
            <VoteCreationForm
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              options={options}
              setOptions={setOptions}
              allowMultiple={allowMultiple}
              setAllowMultiple={setAllowMultiple}
              anonymous={anonymous}
              setAnonymous={setAnonymous}
              endTime={endTime}
              setEndTime={setEndTime}
            />
          ) : (
            <CKEditor5Editor
              onChange={setEditorData}
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              setImage={setImage} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">닫기</Button>
          <Button onClick={category === '투표' ? handleVoteSave : handleSave} color="primary">저장</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box m={5}></Box>
    </Container>
  );
};

export default Board;
