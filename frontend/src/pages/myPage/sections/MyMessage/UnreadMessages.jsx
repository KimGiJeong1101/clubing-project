import React, { useState, useEffect } from "react";
import MessageRow from "../../../../components/auth/MessageRow";
import MessageModal from "../../../../components/auth/MessageModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, markMessageAsRead, deleteMessages } from "../../../../store/actions/myMessageActions";
import { FiChevronLeft, FiChevronRight, FiCheck, FiTrash2 } from "react-icons/fi";
import RowsPerPageSelector from "../../../../components/auth/RowsPerPageSelector";
import CustomCheckbox from "../../../../components/club/CustomCheckbox";
import CustomSnackbarWithTimer from "../../../../components/auth/Snackbar.jsx";

const UnreadMessages = () => {
  const dispatch = useDispatch();
  const messagesData = useSelector((state) => state.myMessage.messages);

  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const user = useSelector((state) => state.user?.userData?.user || {});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  const totalPages = Math.ceil(messages.length / rowsPerPage);

  useEffect(() => {
    if (user.email) {
      dispatch(fetchMessages(user.email));
    }
  }, [user.email, dispatch]);

  useEffect(() => {
    setMessages(messagesData);
  }, [messagesData]);

  const handleReadMessage = (messageId) => {
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(messageId)
        ? prevSelected.filter((id) => id !== messageId)
        : [...prevSelected, messageId],
    );
  };

  const handleMarkAsRead = () => {
    dispatch(markMessageAsRead(selectedMessages))
      .then(() => {
        dispatch(fetchMessages(user.email));
        setSelectedMessages([]);
      })
      .catch((error) => {
        console.error("Error marking messages as read:", error);
      });
  };

  const handleDelete = () => {
    dispatch(deleteMessages(selectedMessages))
      .then(() => {
        setMessages((prevMessages) => prevMessages.filter((msg) => !selectedMessages.includes(msg._id)));
        setSelectedMessages([]);
        setSnackbarMessage("선택한 메시지를 삭제했습니다.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting messages:", error);
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

  const handleSelectAll = () => {
    setIsAllSelected(!isAllSelected);
    const currentMessages = messages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    if (!isAllSelected) {
      setSelectedMessages(currentMessages.map((message) => message._id));
    } else {
      setSelectedMessages([]);
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      {/* 전체선택 + 페이지당 개수 */}
      <div className="mb-3 flex justify-between items-center bg-gray-50 rounded-xl p-3">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
          <CustomCheckbox checked={isAllSelected} onChange={handleSelectAll} />
          전체선택
        </label>
        <RowsPerPageSelector rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
      </div>

      {/* 메시지 목록 */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">읽지 않은 메시지가 없습니다.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {messages
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((message) => (
              <div
                key={message._id}
                onClick={() => handleOpenModal(message)}
                className="cursor-pointer"
              >
                <MessageRow message={message} selectedMessages={selectedMessages} handleReadMessage={handleReadMessage} />
              </div>
            ))}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={handleMarkAsRead}
          disabled={selectedMessages.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-nanum-bold rounded-lg transition-colors"
        >
          <FiCheck size={14} />
          읽음으로 표시
        </button>
        <button
          onClick={handleDelete}
          disabled={selectedMessages.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 text-sm font-nanum-bold rounded-lg transition-colors border border-red-100 disabled:border-gray-100"
        >
          <FiTrash2 size={14} />
          삭제
        </button>
      </div>

      {/* Message Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMessage && (
              <MessageModal
                message={selectedMessage}
                selectedMessages={selectedMessages}
                handleReadMessage={handleReadMessage}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center mt-3 gap-1">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                page === index
                  ? "bg-primary-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <CustomSnackbarWithTimer
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        duration={5000}
      />
    </div>
  );
};

export default UnreadMessages;
