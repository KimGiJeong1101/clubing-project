import React, { useState, useEffect } from 'react';
import { Container, Button, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import CKEditor5Editor from '../../../components/club/ClubBoardRead';
import UpdatePost from '../../../components/club/ClubBoardUpdateEditor';
import ChatIcon from '@mui/icons-material/Chat';
import { fetchPost, deletePost, updatePost } from '../../../api/ClubBoardApi';
import Reply from './Reply'; // 댓글 컴포넌트 추가

const Read = ({ postId, onClose }) => {
  const queryClient = useQueryClient();
  const author = useSelector(state => state.user?.userData?.user?.email || null);

  // 게시물 데이터 가져오기
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    onSuccess: (data) => {
      console.log('게시물 가져오기 성공:', data);
    },
    onError: (error) => {
      console.error('게시물 가져오기 오류:', error);
    },
  });

  // 상태 훅 정의
  const [openEditModal, setOpenEditModal] = useState(false); // 수정 모달 열기 상태
  const [openReply, setOpenReply] = useState(false); // 댓글 컴포넌트 표시 여부 상태
  const [title, setTitle] = useState(''); // 제목 상태
  const [category, setCategory] = useState(''); // 카테고리 상태
  const [content, setContent] = useState(''); // 내용 상태
  const [image, setImage] = useState(''); // 이미지 상태
  const [isAuthor, setIsAuthor] = useState(false); // 작성자 여부 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(''); // 스낵바 메시지 상태
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // 스낵바 심각도 상태

  // 게시물 업데이트 및 작성자 확인 처리
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || '');
      setIsAuthor(post.author === author);
    } else {
      setTitle('');
      setCategory('');
      setContent('');
      setImage('');
      setIsAuthor(false);
    }
  }, [post, author]);

  // 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']); // 게시물 목록 갱신
      onClose(); // 닫기 함수 호출
    },
    onError: (error) => {
      console.error('게시물 삭제 오류:', error);
    },
  });

  // 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: () => updatePost(postId, { title, category, content, image }),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']); // 게시물 목록 갱신
      setOpenEditModal(false); // 수정 모달 닫기
      onClose(); // 닫기 함수 호출
    },
    onError: (error) => {
      console.error('게시물 업데이트 오류:', error);
    },
  });

  // 핸들러 함수
  const handleDelete = () => deleteMutation.mutate(); // 삭제 처리
  const handleSave = () => {
    if (!title) {
      showSnackbar('제목이 없습니다.', 'error');
      return;
    }
    if (!content) {
      showSnackbar('내용이 없습니다.', 'error');
      return;
    }
    updateMutation.mutate(); // 저장 처리
  };

  const handleOpenEditModal = () => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || '');
    }
    setOpenEditModal(true); // 수정 모달 열기
  };

  const handleCloseEditModal = () => setOpenEditModal(false); // 수정 모달 닫기

  const handleToggleReply = () => setOpenReply(prev => !prev); // 댓글 컴포넌트 열기/닫기

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true); // 스낵바 열기
  };

  const handleSnackbarClose = () => setSnackbarOpen(false); // 스낵바 닫기

  // 로딩 상태 처리
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>게시물 가져오기 오류: {error.message}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다</div>;

  const postType = 'Board'; // 포스트 타입

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
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <ChatIcon
                sx={{ color: '#999999', fontSize: '40px', flexShrink: 0 }}
                onClick={handleToggleReply} // 댓글 컴포넌트 열기/닫기
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#DBC7B5', color: '#000', '&:hover': { backgroundColor: '#A67153' } }}
                  onClick={handleOpenEditModal}
                >
                  수정
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#6E3C21', color: '#fff', '&:hover': { backgroundColor: '#A67153' } }}
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </Box>
            </Box>
          )}

          {/* 댓글 컴포넌트를 Read 위치에 렌더링 */}
          {openReply && (
            <Box sx={{ padding: 2 }}>
              <Reply postType={postType} postId={postId} />
            </Box>
          )}

          <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="lg">
            <DialogTitle>게시물 수정</DialogTitle>
            <DialogContent>
              <UpdatePost
                post={{ title, category, content, image }}
                onChange={(data) => setContent(data)}
                title={title}
                setTitle={setTitle}
                category={category}
                setCategory={setCategory}
                content={content}
                setImage={setImage}
              />
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

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
};

export default Read;
