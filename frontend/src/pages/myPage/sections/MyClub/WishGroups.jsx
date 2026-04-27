import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../utils/axios";
import ClubCarousel2 from "../../../../components/club/ClubCarousel2";

const WishGroups = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching user wishes...");
    const fetchUserWishes = async () => {
      try {
        const response = await axiosInstance.get("/users/myPage");
        const userWishes = response.data.user.wish;

        const clubResponses = await Promise.all(userWishes.map((clubId) => axiosInstance.get(`/clubs/read/${clubId}`)));
        const clubsData = clubResponses.map((response) => response.data);

        setClubs(clubsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setLoading(false);
      }
    };

    fetchUserWishes();
  }, [user.email]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <ClubCarousel2 clubList={clubs} />
      )}
    </div>
  );
};

export default WishGroups;
