import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../utils/axios";
import ClubCarousel4 from "../../../../components/club/ClubCarousel4";

// 사용자 정보 가져오기
const fetchUserByEmail = async (email) => {
  try {
    const response = await axiosInstance.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    return { _id: "", name: "Unknown", profilePic: "", nickName: "" };
  }
};

// 채팅방 최근 메시지 1건 가져오기 (실패 시 null 반환)
const fetchLatestMessage = async (clubId) => {
  try {
    const response = await axiosInstance.get(`/clubs/chatrooms/${clubId}/messages?limit=1`);
    return response.data[0] || null; // DESC 정렬이므로 index 0 = 최신
  } catch {
    return null;
  }
};

const MyChatList = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserClubs = async () => {
      try {
        const response = await axiosInstance.get("/users/myPage");
        const userClubs = response.data.user.clubs;

        const clubResponses = await Promise.all(userClubs.map((clubId) => axiosInstance.get(`/clubs/read/${clubId}`)));
        let clubsData = clubResponses.map((response) => response.data);

        // 멤버 정보 + 최근 메시지 병렬 fetch
        clubsData = await Promise.all(
          clubsData.map(async (club) => {
            const [memberInfo, latestMessage] = await Promise.all([Promise.all(club.members.map((memberId) => fetchUserByEmail(memberId))), fetchLatestMessage(club._id)]);
            return { ...club, memberInfo, latestMessage };
          }),
        );

        setClubs(clubsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setError("클럽 데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [user.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-3xl mb-2">⚠️</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <ClubCarousel4 clubList={clubs} />
    </div>
  );
};

export default MyChatList;
