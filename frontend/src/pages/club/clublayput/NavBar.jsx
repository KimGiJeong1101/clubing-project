import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { makeEnterChat } from "../../../store/actions/chatActions";
import { useDispatch, useSelector } from "react-redux";

function ClubNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clubNumber = new URLSearchParams(location.search).get("clubNumber");
  const userId = useSelector((s) => s.user?.userData?.user?._id);

  const selected = (() => {
    const p = location.pathname;
    if (p.includes("board")) return "게시판";
    if (p.includes("gallery")) return "사진첩";
    if (p.includes("chat")) return "채팅";
    return "홈";
  })();

  const handleClickChat = async () => {
    try {
      if (!userId || !clubNumber) return;
      const result = await dispatch(makeEnterChat({ clubId: clubNumber, participants: [userId] }));
      if (!result.payload) throw new Error("채팅방 없음");
      navigate(`/clubs/chat?clubNumber=${clubNumber}`);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: "홈", path: `/clubs/main?clubNumber=${clubNumber}` },
    { name: "게시판", path: `/clubs/board?clubNumber=${clubNumber}` },
    { name: "사진첩", path: `/clubs/gallery?clubNumber=${clubNumber}` },
    { name: "채팅", onClick: handleClickChat },
  ];

  return (
    <nav className="w-full h-[50px] bg-white border-b border-gray-100">
      <div className="container max-w-6xl mx-auto h-full flex items-center justify-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path || "#"}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            }}
            className={`relative flex items-center justify-center h-full w-1/4 text-sm font-hanbit
              transition-colors duration-200 cursor-pointer
              ${selected === item.name ? "text-primary-700 font-nanum-bold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-0.5 after:bg-primary-600 after:rounded-full" : "text-gray-400 hover:text-gray-700"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default ClubNavBar;
