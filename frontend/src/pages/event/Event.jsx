import React, { useState } from "react";
import { FiPlus, FiGift } from "react-icons/fi";
import { useSelector } from "react-redux";
import EventCreate from "./EventCreate";
import EventModify from "./EventModify";
import EventCard from "./EventCard";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import EventListCard from "./EventListCard";
import { useQuery } from "@tanstack/react-query";
import EventDetail from "./EventDetail";

/* ── 스켈레톤 카드 ── */
function SkeletonEventCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

const Event = () => {
  const [openCard,   setOpenCard]   = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openModify, setOpenModify] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventData, setEventData]   = useState(null);
  const [filter,    setFilter]      = useState("ongoing");
  const [snackbarOpen,    setSnackbarOpen]    = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDetail, setOpenDetail] = useState(false);

  const user    = useSelector((state) => state.user?.userData?.user || null);
  const isAdmin = user?.roles === 0;

  const fetchEvents = async () => {
    const response = await axios.get("http://localhost:4000/events/");
    return response.data;
  };

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["events"],
    queryFn:  fetchEvents,
  });

  const handleCloseCard   = () => { setOpenCard(false);   refetch(); };
  const handleCloseCreate = () => setOpenCreate(false);
  const handleCloseModify = () => setOpenModify(false);
  const handleOpenModify  = (eventId) => { setSelectedEventId(eventId); setOpenModify(true); };
  const handleOpenDetail  = (eventId) => { setSelectedEventId(eventId); setOpenDetail(true); };
  const handleCloseDetail = () => { setOpenDetail(false); refetch(); };
  const handleNext        = (data) => { setEventData(data); setOpenCreate(false); setOpenCard(true); };
  const handleNextForModify = (data) => { setEventData(data); setOpenModify(false); setOpenCard(true); };
  const handleDeleteEvent = () => { refetch(); setSnackbarMessage("이벤트가 삭제되었습니다."); setSnackbarOpen(true); };
  const handleEditEvent   = (event) => handleOpenModify(event._id);

  const filteredEvents = events.filter((event) => {
    if (filter === "ongoing") return !event.endTime || new Date(event.endTime) > new Date();
    if (filter === "ended")   return event.endTime && new Date(event.endTime) <= new Date();
    return true;
  });

  /* ── 공통 모달 래퍼 ── */
  const Modal = ({ open, onClose, children, maxWidth = "700px" }) => (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 20,  scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-h-[85vh] overflow-y-auto mx-4"
            style={{ maxWidth }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <p className="text-xs text-primary-500 font-nanum-bold tracking-widest uppercase mb-1">CLUBING</p>
          <h1 className="text-2xl font-nanum-bold text-gray-900">이벤트</h1>
          <p className="text-sm text-gray-400 mt-1">클루빙의 다양한 이벤트에 참여해보세요</p>

          {/* 필터 버튼 */}
          <div className="flex gap-2 mt-6">
            {[
              { key: "ongoing", label: "진행 중" },
              { key: "ended",   label: "종료됨"  },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2 rounded-xl text-sm font-nanum-bold transition-all duration-200
                  ${filter === key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-70">
                  ({events.filter(e =>
                    key === "ongoing"
                      ? !e.endTime || new Date(e.endTime) > new Date()
                      : e.endTime && new Date(e.endTime) <= new Date()
                  ).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 이벤트 그리드 ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <SkeletonEventCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="text-3xl mb-3">⚠️</span>
            <p className="text-gray-500 text-sm">이벤트를 불러오는 중 오류가 발생했습니다</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventListCard
                key={event._id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onImageClick={() => handleOpenDetail(event._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <FiGift className="w-7 h-7 text-rose-300" />
            </div>
            <p className="font-nanum-bold text-gray-700 mb-1">
              {filter === "ongoing" ? "진행 중인 이벤트가 없어요" : "종료된 이벤트가 없어요"}
            </p>
            <p className="text-sm text-gray-400">새로운 이벤트가 생기면 알려드릴게요</p>
          </div>
        )}
      </div>

      {/* ── 관리자 FAB + 모달 ── */}
      {isAdmin && (
        <>
          <button
            onClick={() => setOpenCreate(true)}
            className="fixed bottom-10 right-10 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all duration-200"
            aria-label="이벤트 만들기"
          >
            <FiPlus className="w-6 h-6" />
          </button>

          <Modal open={openCreate} onClose={handleCloseCreate}>
            <EventCreate onClose={handleCloseCreate} onNext={handleNext} />
          </Modal>
          <Modal open={openModify} onClose={handleCloseModify}>
            <EventModify eventId={selectedEventId} onClose={handleCloseModify} onNext={handleNextForModify} />
          </Modal>
          <Modal open={openCard} onClose={handleCloseCard} maxWidth="400px">
            <EventCard eventData={eventData} onClose={handleCloseCard} />
          </Modal>
        </>
      )}

      <Modal open={openDetail} onClose={handleCloseDetail}>
        <EventDetail eventId={selectedEventId} onClose={handleCloseDetail} />
      </Modal>

      {/* 스낵바 */}
      {snackbarOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg min-w-[260px] text-sm">
            <span className="flex-1">{snackbarMessage}</span>
            <button onClick={() => setSnackbarOpen(false)} className="font-bold text-lg leading-none">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
