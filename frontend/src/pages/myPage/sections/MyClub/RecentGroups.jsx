import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../utils/axios";
import ClubCarousel2 from "../../../../components/club/ClubCarousel2";
import { FiClock } from "react-icons/fi";

const RecentGroups = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRecentClubs = async () => {
      try {
        const response = await axiosInstance.get(`/users/recentvisit/${user.email}`);
        const visitList = response.data.RecentVisitList;

        // 방문 기록이 없거나 빈 배열인 경우
        if (!visitList || visitList.length === 0 || !visitList[0]?.clubs?.length) {
          setClubs([]);
          setLoading(false);
          return;
        }

        const RecentClubs = visitList[0].clubs;
        const clubResponses = await Promise.all(RecentClubs.map((clubId) => axiosInstance.get(`/clubs/read/${clubId}`)));
        const clubsData = clubResponses.map((response) => response.data);

        setClubs(clubsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        // 에러여도 빈 상태로 처리 (방문 기록 없음과 동일하게)
        setClubs([]);
        setLoading(false);
      }
    };

    if (user.email) {
      userRecentClubs();
    } else {
      setLoading(false);
    }
  }, [user.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FiClock size={48} className="mb-3 text-gray-200" />
        <p className="text-sm font-nanum-bold">최근 방문한 모임이 없습니다.</p>
        <p className="text-xs mt-1 text-gray-300">모임을 둘러보고 방문해 보세요.</p>
      </div>
    );
  }

  return (
    <div>
      <ClubCarousel2 clubList={clubs} />
    </div>
  );
};

export default RecentGroups;
