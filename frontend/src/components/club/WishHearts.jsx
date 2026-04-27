import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import axiosInstance from "../../utils/axios";
import { toggleFavorite } from "../../store/reducers/wishSlice";
import CustomSnackbarWithTimer from "../auth/Snackbar";

const WishHearts = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const user         = useSelector((s) => s.user.userData.user);
  const favoriteList = useSelector((s) => s.wish.favoriteList);

  const clubNumber = Number(new URLSearchParams(location.search).get("clubNumber"));
  const isFavorite = favoriteList.includes(clubNumber);

  const [snackbar, setSnackbar] = useState({ open: false, msg: "", ok: true });

  const handleToggle = () => {
    if (!user.email) { alert("로그인이 필요한 서비스입니다."); navigate("/login"); return; }
    const url = isFavorite ? `/clubs/removeWish/${clubNumber}` : `/clubs/addWish/${clubNumber}`;
    axiosInstance.post(url)
      .then(() => {
        dispatch(toggleFavorite({ clubNumber }));
        setSnackbar({ open: true, msg: isFavorite ? "찜을 해제했습니다." : "모임을 찜했습니다.", ok: true });
      })
      .catch(() => setSnackbar({ open: true, msg: "찜하기에 실패했습니다.", ok: false }));
  };

  return (
    <>
      <button onClick={handleToggle} className="p-2 flex items-center justify-center transition-transform hover:scale-110">
        {isFavorite
          ? <AiFillHeart className="w-6 h-6 text-red-400" />
          : <FiHeart     className="w-6 h-6 text-gray-400 hover:text-red-400 transition-colors" />
        }
      </button>
      <CustomSnackbarWithTimer
        open={snackbar.open}
        message={snackbar.msg}
        severity={snackbar.ok ? "success" : "error"}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        duration={5000}
      />
    </>
  );
};

export default WishHearts;
