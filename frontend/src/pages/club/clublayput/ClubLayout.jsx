import React, { useEffect, useState } from "react";
import MainHeader from "../../../layout/Header";
import MainFooter from "../../../layout/Footer";
import ClubNavBar from "./NavBar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axios";
import { fetchGetClub } from "../../../store/reducers/clubReducer";
import { sendMessage } from "../../../store/actions/myMessageActions";
import { useDispatch, useSelector } from "react-redux";
import WishHearts from "../../../components/club/WishHearts.jsx";

function ClubLayout() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const clubNumber = new URLSearchParams(location.search).get("clubNumber");
  const getClub    = useSelector((s) => s.getClub);
  const user       = useSelector((s) => s.user.userData.user);

  const [joinHandler, setJoinHandler] = useState(false);

  useEffect(() => {
    if (clubNumber) dispatch(fetchGetClub(clubNumber));
  }, [dispatch, clubNumber]);

  useEffect(() => {
    if (getClub.clubs && user.email) {
      setJoinHandler(!getClub.clubs.members.includes(user.email));
    }
  }, [getClub, user.email, clubNumber]);

  const handleJoin = () => {
    if (!user.email) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    axiosInstance
      .post(`http://localhost:4000/clubs/addMember/${clubNumber}`)
      .then(() => {
        alert("모임 가입성공");
        const msgs = [
          { club: clubNumber, recipient: user.email, sender: getClub.clubs.title, content: `${getClub.clubs.title} 모임 가입을 축하드립니다.`, title: "모임 가입성공" },
          { club: clubNumber, recipient: getClub.clubs.admin, sender: user.email, content: `${user.email}에서 모임에 가입했습니다.`, title: `${user.email}님 모임에 가입` },
        ];
        dispatch(sendMessage(msgs[0]));
        axiosInstance.post("/users/messages", msgs[1])
          .then(() => navigate("/mypage"))
          .catch((err) => console.error("메시지 전송 실패", err));
      })
      .catch(() => alert("모임 가입에 실패했습니다."));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <ClubNavBar />
      <main className="flex-1">
        <Outlet />
        {joinHandler && (
          <div className="fixed bottom-0 left-0 w-full z-50 p-4 flex justify-center">
            <div className="w-full max-w-sm flex rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#F0EDED] flex items-center justify-center w-14">
                <WishHearts />
              </div>
              <button
                onClick={handleJoin}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-lg font-nanum-bold py-3 transition-colors"
              >
                모임 가입하기
              </button>
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}

export default ClubLayout;
