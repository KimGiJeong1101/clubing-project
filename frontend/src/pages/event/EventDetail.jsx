import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Snackbar, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import CKEditor5Editor from '../../components/club/ClubBoardRead';
import axios from 'axios';

const EventDetail = ({ eventId, onClose }) => {
    const author = useSelector(state => state.user?.userData?.user?.email || null);

    // 게시물 데이터 가져오기 함수
    const fetchPost = async (eventId) => {
        try {
            const response = await axios.get(`http://localhost:4000/events/${eventId}`);
            return response.data;
        } catch (error) {
            console.error('게시물 조회 오류:', error);
            throw error;
        }
    };

    // React Query로 게시물 데이터 가져오기
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => fetchPost(eventId),
        onSuccess: (data) => {
            console.log('게시물 가져오기 성공:', data);
        },
        onError: (error) => {
            console.error('게시물 가져오기 오류:', error);
        },
    });

    // 상태 정의
    const [isAuthor, setIsAuthor] = useState(false); // 작성자 여부 상태
    const [snackbarOpen, setSnackbarOpen] = useState(false); // 스낵바 열림 상태
    const [snackbarMessage, setSnackbarMessage] = useState(''); // 스낵바 메시지 상태
    const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // 스낵바 심각도 상태

    // 게시물 데이터와 작성자 확인 처리
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
        setSnackbarOpen(true); // 스낵바 열기
    };

    const handleSnackbarClose = () => setSnackbarOpen(false); // 스낵바 닫기

    // 로딩 상태 처리
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>게시물 가져오기 오류: {error.message}</div>;
    if (!post) return <div>게시물을 찾을 수 없습니다</div>;

    // 날짜 포맷 함수
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <Container sx={{ backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px', maxWidth: '1000px' }}>
            {post && (
                <>
                    {/* 상단 정보 */}
                    <Box sx={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {post.title}
                        </Typography>

                        {/* 작성자와 조회수: 왼쪽, 등록 날짜와 종료 날짜: 오른쪽 */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    작성자: {post.writer}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    조회수: {post.views}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="textSecondary">
                                    등록 날짜: {formatDateTime(post.createdAt)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    종료 날짜: {post.endTime ? formatDateTime(post.endTime) : '없음'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>


                    {/* CKEditor 내용 렌더링 */}
                    <Box className="fetched-content" sx={{ paddingTop: '20px' }}>
                        <CKEditor5Editor content={post.content} readOnly={true} />
                    </Box>
                </>
            )}

            {/* 스낵바 */}
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
        </Container>
    );
};

export default EventDetail;
