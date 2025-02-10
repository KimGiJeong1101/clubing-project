import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Container, Fab, Box, Backdrop, Grid, Button, Typography, Snackbar, Alert } from "@mui/material";
import { useSelector } from "react-redux";
import EventCreate from "./EventCreate";
import EventModify from "./EventModify"; // 수정 모달 추가
import EventCard from "./EventCard";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import EventListCard from "./EventListCard";
import { useQuery } from "@tanstack/react-query";
import EventDetail from "./EventDetail"; // EventDetail 컴포넌트 추가

const Event = () => {
  const [openCard, setOpenCard] = useState(false);
  const [openCreate, setOpenCreate] = useState(false); // EventCreate 모달 열림 상태
  const [openModify, setOpenModify] = useState(false); // EventModify 모달 열림 상태
  const [selectedEventId, setSelectedEventId] = useState(null); // 선택된 이벤트 ID
  const [eventData, setEventData] = useState(null); // 제출할 데이터
  const [filter, setFilter] = useState("ongoing"); // 'ongoing' 또는 'ended' 필터
  const [snackbarOpen, setSnackbarOpen] = useState(false); // 스낵바 열림 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const [openDetail, setOpenDetail] = useState(false); // 상세 페이지 모달 열림 상태

  const user = useSelector((state) => state.user?.userData?.user || null);
  const isAdmin = user?.roles === 0;

  // 이벤트 목록을 가져오는 함수
  const fetchEvents = async () => {
    const response = await axios.get("http://localhost:4000/events/");
    return response.data;
  };

  // React Query의 useQuery 훅 사용
  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // 모달 열기 및 닫기 함수
  const handleClickOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const handleOpenModify = (eventId) => {
    setSelectedEventId(eventId);
    setOpenModify(true);
  };

  const handleCloseModify = () => {
    setOpenModify(false);
  };

  const handleCloseCard = () => {
    setOpenCard(false);
    refetch(); // 새로운 이벤트를 등록한 후 목록을 다시 가져옵니다.
  };

  const handleNext = (data) => {
    setEventData(data);
    setOpenCreate(false);
    setOpenCard(true);
  };

  // 상세 페이지 열기
  const handleOpenDetail = (eventId) => {
    setSelectedEventId(eventId); // eventId 저장
    setOpenDetail(true); // 상세 페이지 모달 열기
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    refetch();
  };

  // 새로 만든 handleNextForModify 함수
  const handleNextForModify = (data) => {
    setEventData(data);
    setOpenModify(false);
    setOpenCard(true);
  };

  // 필터링된 이벤트 목록 계산
  const filteredEvents = events.filter((event) => {
    if (filter === "ongoing") {
      return !event.endTime || new Date(event.endTime) > new Date();
    } else if (filter === "ended") {
      return event.endTime && new Date(event.endTime) <= new Date();
    }
    return true;
  });

  // 삭제 핸들러
  const handleDeleteEvent = (deletedEventId) => {
    refetch(); // 다시 이벤트 목록을 가져오기
    setSnackbarMessage("이벤트가 성공적으로 삭제되었습니다."); // 성공 메시지 설정
    setSnackbarOpen(true); // 스낵바 열기
  };

  // 수정 핸들러 함수 정의
  const handleEditEvent = (event) => {
    handleOpenModify(event._id); // 수정 모달 열기
  };

  // 스낵바 닫기 핸들러
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false); // 스낵바 닫기
  };

  if (isLoading) {
    return (
      <Container sx={{ minHeight: "650px", mb: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6">로딩 중...</Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ minHeight: "650px", mb: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" color="error">
          이벤트를 불러오는 중 오류가 발생했습니다.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ minHeight: "650px", mb: "40px", backgroundColor: "white" }}>
      <h1>EVENT</h1>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setFilter("ongoing")}
          sx={{
            flex: 1,
            borderRadius: "0px",
            height: "50px",
            fontSize: "16px",
            fontWeight: "normal",
            borderColor: filter === "ongoing" ? "#333" : "#ccc",
            color: "#333",
            "&:hover": {
              borderColor: "#333",
            },
          }}
        >
          진행중인 이벤트
        </Button>
        <Button
          variant="outlined"
          onClick={() => setFilter("ended")}
          sx={{
            flex: 1,
            borderRadius: "0px",
            height: "50px",
            fontSize: "16px",
            fontWeight: "normal",
            borderColor: filter === "ended" ? "#333" : "#ccc",
            color: "#333",
            "&:hover": {
              borderColor: "#333",
            },
          }}
        >
          종료된 이벤트
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id} sx={{ boxSizing: "border-box" }}>
              <EventListCard
                event={event}
                onEdit={handleEditEvent} // 수정 핸들러 전달
                onDelete={handleDeleteEvent} // 삭제 핸들러 전달
                onImageClick={() => handleOpenDetail(event._id)} // 이미지 클릭 시 상세 페이지 열기
              />
            </Grid>
          ))
        ) : (
          <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
            <Typography variant="h6">{filter === "ongoing" ? "진행중인 이벤트가 없습니다." : "종료된 이벤트가 없습니다."}</Typography>
          </Box>
        )}
      </Grid>

      {isAdmin && (
        <>
          <Fab
            onClick={handleClickOpenCreate}
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: "100px",
              right: "50px",
              backgroundColor: "#DBC7B5",
              "&:hover": {
                backgroundColor: "#A67153",
              },
            }}
          >
            <AddIcon sx={{ color: "#fff" }} />
          </Fab>

          <AnimatePresence>
            {openCreate && (
              <Backdrop open={true} sx={{ zIndex: 1300 }} onClick={handleCloseCreate}>
                <motion.div initial={{ opacity: 0, x: "100vw" }} animate={{ opacity: 1, x: "0vw" }} exit={{ opacity: 0, x: "-100vw" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 700,
                      maxHeight: "85vh",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: "8px",
                      overflowY: "auto",
                    }}
                  >
                    <EventCreate onClose={handleCloseCreate} onNext={handleNext} />
                  </Box>
                </motion.div>
              </Backdrop>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {openModify && (
              <Backdrop open={true} sx={{ zIndex: 1300 }} onClick={handleCloseModify}>
                <motion.div initial={{ opacity: 0, x: "100vw" }} animate={{ opacity: 1, x: "0vw" }} exit={{ opacity: 0, x: "-100vw" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 700,
                      maxHeight: "85vh",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: "8px",
                      overflowY: "auto",
                    }}
                  >
                    <EventModify
                      eventId={selectedEventId}
                      onClose={handleCloseModify}
                      onNext={handleNextForModify} // 새로운 handleNextForModify 사용
                    />
                  </Box>
                </motion.div>
              </Backdrop>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {openCard && (
              <Backdrop open={true} sx={{ zIndex: 1300 }} onClick={handleCloseCard}>
                <motion.div initial={{ opacity: 0, x: "100vw" }} animate={{ opacity: 1, x: "0vw" }} exit={{ opacity: 0, x: "-100vw" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 400,
                      maxHeight: "85vh",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: "8px",
                      overflowY: "auto",
                    }}
                  >
                    <EventCard eventData={eventData} onClose={handleCloseCard} />
                  </Box>
                </motion.div>
              </Backdrop>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {openDetail && (
              <Backdrop open={true} sx={{ zIndex: 1300 }} onClick={handleCloseDetail}>
                <motion.div initial={{ opacity: 0, x: "100vw" }} animate={{ opacity: 1, x: "0vw" }} exit={{ opacity: 0, x: "-100vw" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 700,
                      maxHeight: "85vh",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: "8px",
                      overflowY: "auto",
                    }}
                  >
                    {/* EventDetail에 eventId 전달 */}
                    <EventDetail eventId={selectedEventId} onClose={handleCloseDetail} />
                  </Box>
                </motion.div>
              </Backdrop>
            )}
          </AnimatePresence>
        </>
      )}

      {/* 스낵바 컴포넌트 */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Event;
