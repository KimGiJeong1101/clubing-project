import React, { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Grid, Dialog, DialogContent, TablePagination, IconButton, } from '@mui/material';
import axiosInstance from '../../../../utils/axios';
import CustomButton2 from '../../../../components/club/CustomButton2.jsx'
import MessageRow from '../../../../components/auth/MessageRow'
import MessageModal from '../../../../components/auth/MessageModal'; // MessageModal 컴포넌트 경로
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RowsPerPageSelector from '../../../../components/auth/RowsPerPageSelector'
import CustomCheckbox from '../../../../components/club/CustomCheckbox'; // CustomCheckbox 컴포넌트 경로
import CustomSnackbarWithTimer from '../../../../components/auth/Snackbar.jsx'; // CustomCheckbox 컴포넌트 경로

const ReadMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null); // 선택된 메시지 상태
  const [openModal, setOpenModal] = useState(false); // 모달 열림/닫힘 상태
  const [isAllSelected, setIsAllSelected] = useState(false); // 전체 선택 상태

  const user = useSelector((state) => state.user?.userData?.user || {});
  
  // 페이징 상태 추가
  const [page, setPage] = useState(0); // 현재 페이지
  const [rowsPerPage, setRowsPerPage] = useState(3); // 페이지당 항목 수

  const totalPages = Math.ceil(messages.length / rowsPerPage);

  //정보 리드
  useEffect(() => {
    if (user.email) { // user.email이 있을 경우에만 요청
      axiosInstance.get(`/users/messages/${user.email}/true`)
        .then(response => 
          setMessages(response.data))
        .catch(error => 
          console.error('Error fetching messages:', error));
    }
  }, [user.email]);
  
  const handleReadMessage = (messageId) => {
    setSelectedMessages(prevSelected => 
      prevSelected.includes(messageId) 
        ? prevSelected.filter(id => id !== messageId) 
        : [...prevSelected, messageId]
    );
  };

   //스낵바
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

   const handleSnackbarClose = () => {
       setSnackbarOpen(false); // 스낵바 닫기
     };

    //정보 삭제
  const handleDelete = () => {
    // 선택한 메시지를 삭제하는 API 호출
    axiosInstance.post('/users/messages/delete', { ids: selectedMessages })
      .then(response => {
        // 성공 시 메시지 목록 갱신
        setMessages(prevMessages => 
          prevMessages.filter(msg => !selectedMessages.includes(msg._id))
        );
        // 선택 상태 초기화
        setSelectedMessages([]);

         // 삭제 성공 시 스낵바 열기
        setSnackbarMessage("선택한 메시지를 삭제했습니다.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true); // 스낵바 열기
      })
      .catch(error => {
        console.error('Error deleting messages:', error);
        // 오류 처리: 사용자에게 오류 메시지 표시 또는 기타 조치
      });
  };

  const handleOpenModal = (message) => {
    setSelectedMessage(message);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMessage(null);
  };

    // 전체 선택 체크박스 클릭 핸들러
    const handleSelectAll = () => {
      setIsAllSelected(!isAllSelected);
  
      // 현재 페이지에서 보여지는 메시지들만 전체 선택
      const currentMessages = messages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      if (!isAllSelected) {
        setSelectedMessages(currentMessages.map(message => message._id));
      } else {
        setSelectedMessages([]);
      }
    };

  return (
    <Box>
      {/* 메시지 보이고 싶은 량 및 체크박스 전체 선택*/}
      <Box 
      sx={{
        mt: 2,
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white', // 흰색 배경
        borderRadius: '8px', // 모서리를 둥글게
        padding: '16px', // 내부 여백
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' // 약간의 그림자 효과 (선택 사항)
      }}
      >
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
        <CustomCheckbox
            checked={isAllSelected}
            onChange={handleSelectAll} // onChange 사용
          />
          전체선택 
        </Box>
        <Box>
          <RowsPerPageSelector rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Box>
      </Box>
      <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {/* 테이블 헤더 내용 */}
        </TableHead>
        <TableBody>
          {messages
           .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 현재 페이지와 항목 수에 맞게 데이터 슬라이싱
           .sort((a, b) => new Date(b.date) - new Date(a.date)) // 내림차순 정렬
          .map(message => (
            <TableRow key={message._id} onClick={() => handleOpenModal(message)} style={{ cursor: 'pointer' }}>
              <MessageRow
                message={message}
                selectedMessages={selectedMessages}
                handleReadMessage={handleReadMessage}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <CustomButton2 onClick={handleDelete} variant="contained" color="error">삭제</CustomButton2>
          </Box>

          {/* Message Modal */}
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogContent>
              {selectedMessage && (
                <MessageModal
                  message={selectedMessage}
                  selectedMessages={selectedMessages}
                  handleReadMessage ={handleReadMessage}
                  onClose={handleCloseModal} // 모달 닫기 핸들러 전달
                />
              )}
            </DialogContent>
          </Dialog>

      {/* Table Pagination */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <IconButton onClick={() => setPage(prevPage => Math.max(prevPage - 1, 0))} disabled={page === 0}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, index) => (
                <IconButton
                  key={index}
                  onClick={() => setPage(index)}
                  sx={{ mx: 0.5 }}
                  color={page === index ? 'primary' : 'default'}
                >
                  <Typography variant="body2">{index + 1}</Typography>
                </IconButton>
              ))}
            </Box>
            <IconButton onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages - 1))} disabled={page >= totalPages - 1}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          {/* 스낵바 컴포넌트 추가 */}
          <CustomSnackbarWithTimer
            open={snackbarOpen}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={handleSnackbarClose}
            duration={5000} // 원하는 시간 동안 스낵바 유지
          />
        </Box>
      );
    };


export default ReadMessages;
