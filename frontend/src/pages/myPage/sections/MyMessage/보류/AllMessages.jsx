import React, { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Dialog, DialogContent, IconButton } from '@mui/material';
import axiosInstance from '../../../../../utils/axios.js';
import CustomButton2 from '../../../../../components/club/CustomButton2.jsx'
import CustomButton from '../../../../../components/club/CustomButton.jsx'
import MessageRow from '../../../../../components/auth/MessageRow.jsx'
import MessageModal from '../../../../../components/auth/MessageModal.jsx'; // MessageModal 컴포넌트 경로
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, markMessagesAsRead, deleteMessages } from '../../../../../store/actions/myMessageActions.js';

const AllMessages = () => {
  const dispatch = useDispatch();
  const messagesData = useSelector((state) => state.myMessage.messages);

  const [messages, setMessages] = useState([]); // 초기 상태를 빈 배열로 설정
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null); // 선택된 메시지 상태
  const [openModal, setOpenModal] = useState(false); // 모달 열림/닫힘 상태

  const user = useSelector((state) => state.user?.userData?.user || {});

    // 안 읽음 메시지 불러오기 (리덕스 디스패치 사용)
  useEffect(() => {
    if (user.email) {
      dispatch(fetchMessages(user.email)); // 안 읽음 메시지 불러오기
    }
  }, [user.email, dispatch]);

  // 읽음 메시지
  useEffect(() => {
    if (user.email) { // user.email이 있을 경우에만 요청
      axiosInstance.get(`/users/messages/${user.email}`)
        .then(response => 
          setMessages(response.data))
        .catch(error => 
          console.error('Error fetching messages:', error));
    }
  }, [user.email]);

  useEffect(() => {
    setMessages(messagesData); // 가져온 메시지 데이터를 상태에 설정
  }, [messagesData]);

  const handleCheckboxChange = (messageId) => {
    setSelectedMessages(prevSelected => 
      prevSelected.includes(messageId) 
        ? prevSelected.filter(id => id !== messageId) 
        : [...prevSelected, messageId]
    );
  };

  // const handleMarkAsRead = () => {
  //   // 선택한 메시지를 읽음으로 표시하는 API 호출
  //   axiosInstance.post('/users/messages/mark-read', { ids: selectedMessages })
  //     .then(response => {
  //       // 성공 시 메시지 목록 갱신
  //       setMessages(prevMessages => prevMessages.map(msg => 
  //         selectedMessages.includes(msg._id) 
  //           ? { ...msg, isRead: true } 
  //           : msg
  //       ));
  //       setSelectedMessages([]);
  //     })
  //     .catch(error => console.error('Error marking messages as read:', error));
  // };

  // const handleDelete = () => {
  //   // 선택한 메시지를 삭제하는 API 호출
  //   axiosInstance.post('/users/messages/delete', { ids: selectedMessages })
  //     .then(response => {
  //       // 성공 시 메시지 목록 갱신
  //       setMessages(prevMessages => prevMessages.filter(msg => !selectedMessages.includes(msg._id)));
  //       setSelectedMessages([]);
  //     })
  //     .catch(error => console.error('Error deleting messages:', error));
  // };

  const handleOpenModal = (message) => {
    setSelectedMessage(message);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMessage(null);
  };

  // 모달 열엇을 때 안 읽음 읽음으로
  const handleMessageRead = (messageId) => {
    // 상태를 업데이트하거나 메시지를 다시 가져오는 로직
    console.log('Message read:', messageId);
  };

  return (
    <Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {/* 테이블 헤더 내용 */}
        </TableHead>
        <TableBody>
          {messages.map(message => (
            <TableRow key={message._id} onClick={() => handleOpenModal(message)} style={{ cursor: 'pointer' }}>
              <MessageRow
                message={message}
                selectedMessages={selectedMessages}
                handleCheckboxChange={handleCheckboxChange}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
      <CustomButton onClick={() => {}} variant="contained" color="primary" sx={{ mr: 1 }}>읽음으로 표시</CustomButton>
      <CustomButton2 onClick={() => {}} variant="contained" color="error">삭제</CustomButton2>
    </Box>

     {/* Message Modal */}
     <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedMessage && (
            <MessageModal
              message={selectedMessage}
              selectedMessages={selectedMessages}
              onMessageRead={handleMessageRead}
              handleCheckboxChange={handleCheckboxChange}
              onClose={handleCloseModal} // 모달 닫기 핸들러 전달
            />
          )}
        </DialogContent>
      </Dialog>
  </Box>
  );
};


export default AllMessages;
