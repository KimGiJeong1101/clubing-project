import React, { useEffect, useState, useRef } from "react";
import { FiArrowLeft, FiShare2, FiHeart, FiMenu } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { fetchGetClub } from "../../../store/reducers/clubReducer";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axios";

function Header() {
  const location = useLocation();
  const dispatch = useDispatch();
  const getClub = useSelector((state) => state.getClub);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData.user);

  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  const [isFavorite, setIsFavorite] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (clubNumber) dispatch(fetchGetClub(clubNumber));
  }, [dispatch, clubNumber]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`http://localhost:4000/clubs/delete/${clubNumber}`);
      navigate("/clublist");
      alert("삭제 완료");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
    setMenuOpen(false);
  };

  const cancellClub = () => {
    if (!user.email) { alert("로그인이 필요한 서비스입니다."); navigate("/login"); return; }
    axiosInstance.post(`http://localhost:4000/clubs/cencellMember/${clubNumber}`)
      .then(() => { alert("모임 탈퇴 성공"); navigate("/mypage"); })
      .catch(() => alert("모임 탈퇴에 실패했습니다."));
    setMenuOpen(false);
  };

  const clubs = getClub.clubs || {};
  const adminEmail = clubs.admin || "";
  const members = Array.isArray(clubs.members) ? clubs.members : [];

  return (
    <div className="fixed top-0 left-0 w-full h-[70px] bg-white border-b border-gray-100 shadow-sm z-[1100] flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center gap-2">
        <button
          onClick={() => navigate("/clublist")}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="flex-1 text-base font-nanum-bold text-gray-900 truncate">
          {getClub.clubs?.title}
        </h1>

        <button
          onClick={() => setIsFavorite((p) => !p)}
          className="p-2 transition-colors"
        >
          {isFavorite
            ? <AiFillHeart className="w-5 h-5 text-red-400" />
            : <FiHeart className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />}
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
          <FiShare2 className="w-5 h-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {user.email === adminEmail && (
                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  클럽 삭제하기
                </button>
              )}
              {user.email !== clubs.admin && members.includes(user.email) && (
                <button onClick={cancellClub} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  클럽 탈퇴하기
                </button>
              )}
              <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                모임 url 공유하기
              </button>
              <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                모임 신고하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
