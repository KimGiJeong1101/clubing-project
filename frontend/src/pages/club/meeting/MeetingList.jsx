import React, { useEffect, useState } from "react";
import clubCategories from "../main/CategoriesDataClub";
import { useQuery } from "@tanstack/react-query";
import { FiUsers, FiMapPin, FiDollarSign, FiClock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axios";
import MeetingListByCategory from "./MeetingListByCategory";
import MeetingListAsUser from "./MeetingListAsUser";

/* ── 공통 미팅 카드 ── */
export const MeetingCard = ({ meeting, onClick }) => {
  const avatarList = meeting?.joinMemberInfo || [];
  const joined = meeting?.joinMember?.length ?? 0;
  const total = meeting?.totalCount ?? 0;
  const isFull = total > 0 && joined >= total;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col" onClick={onClick}>
      {/* 이미지 */}
      <div className="w-full aspect-video overflow-hidden relative">
        <img src={`http://localhost:4000/${meeting.img}`} alt="meeting" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {/* 마감 뱃지 */}
        {isFull && <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-nanum-bold px-2 py-0.5 rounded-full">마감</span>}
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-col flex-1 p-4">
        <h5 className="font-nanum-bold text-sm text-gray-900 truncate mb-2.5">{meeting.title}</h5>

        <div className="space-y-1.5 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3 h-3 flex-shrink-0 text-primary-400" />
            <span className="truncate">{meeting.dateTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiMapPin className="w-3 h-3 flex-shrink-0 text-primary-400" />
            <span className="truncate">{meeting.where}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiDollarSign className="w-3 h-3 flex-shrink-0 text-primary-400" />
            <span className="truncate">{meeting.cost}</span>
          </div>
        </div>

        {/* 하단: 아바타 + 인원 */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          <div className="flex -space-x-1.5">
            {avatarList.slice(0, 4).map((member, idx) => (
              <img key={idx} src={member.thumbnailImage} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 ml-0.5">
            <FiUsers className="w-3 h-3" />
            <span>
              <span className={isFull ? "text-red-400 font-nanum-bold" : ""}>{joined}</span>
              <span className="text-gray-300 mx-0.5">/</span>
              {total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingList = () => {
  const [nowTime, setNowTime] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [category, setCategory] = useState([...Object.keys(clubCategories)]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(0);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [nowDate, setNowDate] = useState("");
  const navigate = useNavigate();
  const [moreMeetingList, setMoreMeetingList] = useState([]);
  const [moreMeetingListCount, setMoreMeetingListCount] = useState(0);
  const [passCategory, setPassCategory] = useState("푸드·드링크");

  const moreMeetingListHandler = () => setMoreMeetingListCount((prev) => prev + 1);

  const fetchMeetings = async () => {
    try {
      const response = await axiosInstance.get(`/meetings?nowDate=${nowDate}&count=${moreMeetingListCount}`);
      setMoreMeetingList((prev) => [...prev, ...response.data]);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    if (moreMeetingListCount !== 0) fetchMeetings();
  }, [moreMeetingListCount]);

  useEffect(() => {
    const now = new Date();
    const dateList = [];
    for (let i = 0; i < 14; i++) {
      const tempDate = new Date(now);
      tempDate.setDate(now.getDate() + i);
      dateList.push({
        date: tempDate.getDate(),
        day: days[tempDate.getDay()],
        fullDate: tempDate.toISOString().split("T")[0],
        isToday: i === 0,
        isSunday: tempDate.getDay() === 0,
        isSaturday: tempDate.getDay() === 6,
      });
    }
    setNowTime(dateList);
    setNowDate(dateList[0].fullDate);
  }, []);

  const handleTabClick = (date, idx) => {
    setNowDate(date);
    setSelectedTab(idx);
    setMoreMeetingListCount(0);
    setMoreMeetingList([]);
  };

  const getMeetingList = async () => {
    const res = await fetch(`http://localhost:4000/meetings?nowDate=${nowDate}`);
    return res.json();
  };

  const {
    data: meetingList,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["meetingList", nowDate],
    queryFn: getMeetingList,
    enabled: !!nowDate,
    keepPreviousData: true,
  });

  const handleCategoryTabChange = (idx) => {
    setSelectedCategoryTab(idx);
    setPassCategory(category[idx]);
  };

  const allMeetings = [...(meetingList || []).slice(0, 4), ...moreMeetingList.slice(0, moreMeetingListCount * 4)];

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>
      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-7">
          <p className="text-xs text-primary-500 font-nanum-bold tracking-widest uppercase mb-1">CLUBING</p>
          <h1 className="text-2xl font-nanum-bold text-gray-900">정모 일정</h1>
          <p className="text-sm text-gray-400 mt-1">날짜별로 예정된 정기모임을 확인해보세요</p>

          {/* 날짜 탭 */}
          <div className="overflow-x-auto mt-6 -mb-[1px]">
            <div className="flex gap-1.5 min-w-max pb-1">
              {nowTime.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleTabClick(item.fullDate, i)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl font-nanum transition-all duration-200 min-w-[48px]
                    ${selectedTab === i ? "bg-primary-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <span
                    className={`text-[10px] font-nanum mb-0.5
                    ${selectedTab !== i && item.isSunday ? "text-red-400" : ""}
                    ${selectedTab !== i && item.isSaturday ? "text-blue-400" : ""}
                  `}
                  >
                    {item.isToday ? "오늘" : item.day}
                  </span>
                  <span className="text-base font-nanum-bold">{item.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* ── 날짜별 정모 리스트 ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="w-5 h-5 text-primary-500" />
            <h2 className="font-nanum-bold text-gray-800">{nowTime[selectedTab]?.fullDate} 정기모임</h2>
          </div>

          {isLoading && !isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="w-full aspect-video bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">오류: {error.message}</div>
          ) : allMeetings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {allMeetings.map((meeting, idx) => (
                  <MeetingCard key={idx} meeting={meeting} onClick={() => navigate(`/clubs/main?clubNumber=${meeting.clubNumber}`)} />
                ))}
              </div>
              {/* 더보기 버튼 */}
              {((moreMeetingListCount === 0 && meetingList?.length === 5) || (moreMeetingList.length > 0 && moreMeetingList.length % 4 === 0)) && (
                <button onClick={moreMeetingListHandler} className="w-full py-3 bg-white hover:bg-primary-50 text-primary-600 font-nanum-bold rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-all duration-200 text-sm">
                  더 불러오기
                </button>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-12 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
                <FiCalendar className="w-6 h-6 text-primary-300" />
              </div>
              <p className="font-nanum-bold text-gray-600 text-sm">이 날 예정된 정기모임이 없어요</p>
              <p className="text-xs text-gray-400 mt-1">다른 날짜를 선택해보세요</p>
            </div>
          )}
        </section>

        {/* ── 카테고리별 정모 ── */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #a6836f, #dbc7b5)" }} />
            <h2 className="font-nanum-bold text-gray-800 text-lg">카테고리별 정기모임</h2>
          </div>

          {/* 카테고리 탭 */}
          <div className="overflow-x-auto mb-5">
            <div className="flex gap-1.5 min-w-max pb-1">
              {category.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCategoryTabChange(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-nanum-bold transition-all duration-200 whitespace-nowrap
                    ${selectedCategoryTab === idx ? "bg-primary-600 text-white shadow-sm" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {passCategory && <MeetingListByCategory passCategory={passCategory} />}
        </section>

        {/* ── 맞춤 추천 정모 ── */}
        <section className="mt-12">
          <MeetingListAsUser />
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
};

export default MeetingList;
