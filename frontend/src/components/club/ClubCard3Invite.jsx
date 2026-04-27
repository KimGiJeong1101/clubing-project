import React, { useEffect, useState } from "react";
import { FiUsers, FiMapPin, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axios.js";
import CustomSnackbarWithTimer from "../auth/Snackbar";

const ClubCard3Invite = ({ clubList }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.userData?.user || {});
  const [userInvite, setUserInvite] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", ok: true });

  useEffect(() => {
    const fetchUserInvite = async () => {
      try {
        const response = await axiosInstance.get("/users/myPage");
        setUserInvite(response.data.user?.invite || []);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };
    fetchUserInvite();
  }, [user.email]);

  const handleRejectInvite = async (e, clubId) => {
    e.stopPropagation();
    try {
      await axiosInstance.post(`/users/reject-invite`, { clubId });
      setSnackbar({ open: true, msg: "초대가 거절되었습니다.", ok: true });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setSnackbar({ open: true, msg: "초대 거절 중 오류가 발생했습니다.", ok: false });
    }
  };

  return (
    <>
      <div className="space-y-3">
        {clubList.map((item) => (
          <div key={item._id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden flex cursor-pointer transition-all duration-300 border border-gray-100 hover:border-primary-100" onClick={() => navigate(`/clubs/main?clubNumber=${item._id}`)}>
            {/* 썸네일 */}
            <div className="w-[90px] sm:w-[120px] flex-shrink-0 overflow-hidden bg-gray-100">
              <img src={`http://localhost:4000/${item.img}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>

            {/* 콘텐츠 */}
            <div className="flex flex-col flex-1 p-3 min-w-0 pr-[70px]">
              {item.admin === user.email && <span className="self-start mb-1 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-nanum-bold">내가 만든 모임</span>}
              <h3 className="text-sm font-nanum-bold text-gray-900 truncate mb-0.5">{item.title}</h3>
              <p className="text-xs text-gray-400 truncate mb-1">{item.subTitle}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <FiMapPin size={11} />
                <span>{item.region?.district || "지역 미정"}</span>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <div className="flex -space-x-2">
                  {item.members?.slice(0, 4).map((m, i) => (
                    <img key={i} src={m.img || "https://via.placeholder.com/32"} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 ml-1">
                  <FiUsers size={12} />
                  <span>
                    {item.members?.length}/{item.maxMember}명
                  </span>
                </div>
              </div>
            </div>

            {/* 거절 버튼 */}
            {userInvite && (
              <button className="absolute bottom-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100 font-nanum-bold z-10" onClick={(e) => handleRejectInvite(e, item._id)}>
                <FiX size={12} />
                거절
              </button>
            )}
          </div>
        ))}
      </div>

      <CustomSnackbarWithTimer open={snackbar.open} message={snackbar.msg} severity={snackbar.ok ? "success" : "error"} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} duration={5000} />
    </>
  );
};

export default ClubCard3Invite;
