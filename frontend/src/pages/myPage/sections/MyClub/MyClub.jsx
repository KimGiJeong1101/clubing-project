import React, { useState, useEffect } from "react";
import InvitedGroups from "./InvitedGroups";
import MyGroups      from "./MyGroups";
import { useSelector } from "react-redux";
import RecentGroups  from "./RecentGroups";
import WishGroups    from "./WishGroups";
import axiosInstance from "../../../../utils/axios";

const tabList = [
  { key: "myGroups",      label: "내 모임" },
  { key: "wishGroups",    label: "찜 모임" },
  { key: "recentGroups",  label: "최근 방문" },
  { key: "invitedGroups", label: "초대받은 모임" },
];

const MyClub = () => {
  const [activeItem, setActiveItem] = useState("myGroups");
  const [counts, setCounts] = useState({
    myGroups: 0, wishGroups: 0, recentGroups: 0, inviteGroups: 0,
  });

  const user = useSelector((state) => state.user?.userData?.user || {});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosInstance.get("/users/myPage");
        const { counts: c } = response.data;
        const recentRes = await axiosInstance.get(`/users/recentvisit/${user.email}`);
        const recentClubs = recentRes.data.RecentVisitList?.[0]?.clubCount || 0;
        setCounts({ ...c, recentGroups: recentClubs });
      } catch (err) {
        console.error("Error fetching group counts:", err);
      }
    };
    fetchCounts();
  }, [user.email]);

  const countMap = {
    myGroups:      counts.myGroups,
    wishGroups:    counts.wishGroups,
    recentGroups:  counts.recentGroups,
    invitedGroups: counts.inviteGroups,
  };

  return (
    <div className="w-full">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabList.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveItem(key)}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-nanum-bold transition-colors duration-200
              ${activeItem === key ? "text-primary-700" : "text-gray-400 hover:text-gray-700"}`}
          >
            {label}
            {countMap[key] > 0 && (
              <span className={`ml-1 text-xs ${activeItem === key ? "text-primary-500" : "text-gray-300"}`}>
                {countMap[key]}
              </span>
            )}
            {/* 하단 indicator */}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary-600 transition-all duration-300
                ${activeItem === key ? "w-[60%]" : "w-0"}`}
            />
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="min-h-[200px]">
        {activeItem === "myGroups"      && <MyGroups />}
        {activeItem === "wishGroups"    && <WishGroups />}
        {activeItem === "invitedGroups" && <InvitedGroups />}
        {activeItem === "recentGroups"  && <RecentGroups />}
      </div>
    </div>
  );
};

export default MyClub;
