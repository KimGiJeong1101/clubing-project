import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MeetingCard } from "./MeetingList";

const MeetingListByCategory = ({ passCategory }) => {
  const navigate = useNavigate();
  const [moreMeetingListCount, setMoreMeetingListCount] = useState(0);
  const [moreMeetingList, setMoreMeetingList] = useState([]);

  const moreMeetingListHandler = () => setMoreMeetingListCount((prev) => prev + 1);

  const getCategoryMeetingList = async () => {
    const response = await axiosInstance.get(`/meetings/category/${passCategory}`);
    setMoreMeetingListCount(0);
    setMoreMeetingList([]);
    return response.data;
  };

  const fetchMeetings = async () => {
    try {
      const response = await axiosInstance.get(`/meetings/category/${passCategory}?count=${moreMeetingListCount}`);
      setMoreMeetingList((prev) => [...prev, ...response.data]);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    if (moreMeetingListCount !== 0) fetchMeetings();
  }, [moreMeetingListCount]);

  const { data: categoryMeetingList, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["categoryMeetingList", passCategory],
    queryFn:  getCategoryMeetingList,
    keepPreviousData: true,
  });

  if (isLoading && !isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="w-full aspect-video bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-gray-400 py-4">오류: {error.message}</div>;
  }

  const allMeetings = [
    ...(categoryMeetingList || []).slice(0, 4),
    ...moreMeetingList.slice(0, moreMeetingListCount * 4),
  ];

  if (allMeetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-10 text-center">
        <p className="text-sm font-nanum-bold text-gray-500">선택한 카테고리의 정기모임이 없어요</p>
        <p className="text-xs text-gray-400 mt-1">다른 카테고리를 선택해보세요</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {allMeetings.map((meeting, idx) => (
          <MeetingCard
            key={idx}
            meeting={meeting}
            onClick={() => navigate(`/clubs/main?clubNumber=${meeting.clubNumber}`)}
          />
        ))}
      </div>

      {/* 더보기 */}
      {((moreMeetingListCount === 0 && categoryMeetingList?.length === 5) ||
        (moreMeetingList.length > 0 && moreMeetingList.length % 4 === 0)) && (
        <button
          onClick={moreMeetingListHandler}
          className="w-full py-3 bg-white hover:bg-primary-50 text-primary-600 font-nanum-bold rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-all duration-200 text-sm"
        >
          더 불러오기
        </button>
      )}
    </div>
  );
};

export default MeetingListByCategory;
