import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "발견",    path: "/home" },
  { name: "추천모임", path: "/clubList" },
  { name: "정모일정", path: "/meetingList" },
  { name: "신규모임", path: "/newClubList" },
  { name: "클래스",  path: "/class" },
  { name: "이벤트",  path: "/event" },
];

function NavBar() {
  const location = useLocation();
  const [scrollY,    setScrollY]    = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  const selected = (() => {
    const p = location.pathname;
    if (p.includes("home"))          return "발견";
    if (p.includes("meetingList"))   return "정모일정";
    if (p.includes("newClubList"))   return "신규모임";
    if (p.includes("class"))         return "클래스";
    if (p.includes("event"))         return "이벤트";
    return "추천모임";
  })();

  useEffect(() => {
    const onScroll = () => {
      setShowNavbar(window.scrollY < 100 || window.scrollY < scrollY);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  return (
    <>
      <div className="w-full h-[50px]" />
      <nav
        className={`fixed top-[85px] left-0 w-full h-[50px] bg-white border-b border-gray-100 z-40
          transition-transform duration-300
          ${showNavbar ? "translate-y-0" : "-translate-y-[135px]"}`}
      >
        <div className="container max-w-6xl mx-auto h-full flex items-center justify-center gap-0 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex items-center justify-center h-full px-5 text-[14px] font-hanbit
                transition-colors duration-200 whitespace-nowrap
                ${selected === item.name
                  ? "text-gray-900 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[70%] after:h-0.5 after:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default NavBar;
