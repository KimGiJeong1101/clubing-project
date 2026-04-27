import React, { useState } from "react";
import axiosInstance from "../../../utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { MeetingCard } from "./MeetingList";

const MeetingListAsUser = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const user = useSelector((state) => state.user);
  const email = user?.userData?.user?.email;

  const getMeetingListAsUser = async () => {
    const response = await axiosInstance.get(`/meetings/suggestForUser`);
    return response.data;
  };

  const { data: meetingListAsUser, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["meetingListAsUser"],
    queryFn:  getMeetingListAsUser,
    keepPreviousData: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const refreshHandler = () => {
    setSpinning(true);
    refetch().finally(() => setTimeout(() => setSpinning(false), 1000));
  };

  return (
    <div>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #a6836f, #dbc7b5)" }} />
          <h2 className="font-nanum-bold text-gray-800 text-lg">맞춤 추천 정모</h2>
          <span className="text-xs text-gray-400 font-nanum">선택한 카테고리 위주로 추천해드려요</span>
        </div>
        <button
          onClick={refreshHandler}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-nanum-bold transition-colors"
          aria-label="추천 새로고침"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {/* 목록 */}
      {isLoading && !isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse flex">
              <div className="w-[120px] bg-gray-200 flex-shrink-0 h-[100px]" />
              <div className="flex-1 p-3.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-400">
          오류: {error?.message}
        </div>
      ) : isLoading && !isFetching ? (
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
      ) : !email ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <FiUsers className="w-6 h-6 text-primary-300" />
          </div>
          <p className="font-nanum-bold text-gray-600 text-sm">로그인하면 맞춤 정모를 추천해드려요</p>
        </div>
      ) : meetingListAsUser?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetingListAsUser.slice(0, 6).map((meeting, idx) => (
            <MeetingCard
              key={idx}
              meeting={meeting}
              onClick={() => navigate(`/clubs/main?clubNumber=${meeting.clubNumber}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <FiUsers className="w-6 h-6 text-primary-300" />
          </div>
          <p className="font-nanum-bold text-gray-600 text-sm">맞춤 추천 정모가 없어요</p>
          <p className="text-xs text-gray-400 mt-1">마이페이지에서 관심사를 추가해주세요</p>
        </div>
      )}
    </div>
  );
};

export default MeetingListAsUser;
