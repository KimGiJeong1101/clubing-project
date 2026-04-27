import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/actions/userActions";
import { fetchMessages } from "../store/actions/myMessageActions";
import axios from "axios";
import { FiSearch, FiBell, FiMessageSquare, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { name: "모임찾기", path: "/clubList" },
  { name: "정모일정", path: "/meetingList" },
  { name: "추천모임", path: "/recommendedClubList" },
  { name: "이벤트", path: "/event" },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((s) => s.user?.isAuth);
  const user = useSelector((s) => s.user?.userData?.user || {});
  const messages = useSelector((s) => s.myMessage?.messages || []);

  const [scrollY, setScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const selected = (() => {
    const p = location.pathname;
    if (p.includes("clubList")) return "모임찾기";
    if (p.includes("meetingList")) return "정모일정";
    if (p.includes("recommendedClubList")) return "추천모임";
    if (p.includes("event")) return "이벤트";
    return "";
  })();

  /* 스크롤 숨김 */
  useEffect(() => {
    const onScroll = () => {
      setShowHeader((prev) => window.scrollY < 100 || window.scrollY < scrollY);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  /* 메시지 fetch */
  useEffect(() => {
    if (user.email) dispatch(fetchMessages(user.email));
  }, [user.email, location.pathname, dispatch]);

  /* 안 읽은 메시지 수 */
  useEffect(() => {
    setUnreadCount(messages.filter((m) => !m.isRead).length);
  }, [messages]);

  /* 바깥 클릭 시 메뉴 닫기 */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 검색 */
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await axios.get(`http://localhost:4000/clubs/search/test?title=${term}`);
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/login"));
    setMenuOpen(false);
    setDrawerOpen(false);
  };

  const userRoutes = [
    { to: "/login", name: "로그인", auth: false, icon: <FiLogIn className="mr-2" /> },
    { to: "/register", name: "회원가입", auth: false, icon: <FiUserPlus className="mr-2" /> },
    { to: "/mypage", name: "마이페이지", auth: true, icon: <FiUser className="mr-2" /> },
    { to: "", name: "로그아웃", auth: true, icon: <FiLogOut className="mr-2" /> },
  ];

  return (
    <>
      {/* ── 헤더 ── */}
      <div className="w-full h-[70px]" />
      <header
        className={`fixed top-0 left-0 w-full h-[70px] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm z-50
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="container max-w-6xl mx-auto h-full flex items-center justify-between px-4">
          {/* 로고 */}
          <Link to="/">
            <img src="/logo/khaki_long_h.png" alt="Clubing" className="h-[42px]" />
          </Link>

          {/* 데스크탑 nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className={`nav-link px-4 py-2 text-[15px] ${selected === item.name ? "nav-link-active" : ""}`}>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 우측 아이콘 */}
          <div className="flex items-center gap-1">
            {/* 검색 */}
            <div className="relative" ref={searchRef}>
              <button onClick={() => setSearchOpen((o) => !o)} className="btn-ghost p-2 rounded-full" aria-label="검색">
                <FiSearch className="w-5 h-5 text-gray-500" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <FiSearch className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    <input autoFocus type="text" placeholder="모임 이름 검색..." value={searchTerm} onChange={handleSearch} className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" />
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="mt-2 max-h-60 overflow-y-auto">
                      {searchResults.map((club) => (
                        <li key={club._id}>
                          <Link
                            to={`/clubs/main?clubNumber=${club._id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchTerm("");
                              setSearchResults([]);
                            }}
                            className="block px-2 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                          >
                            {club.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchTerm && searchResults.length === 0 && <p className="mt-3 text-sm text-gray-400 text-center">검색 결과가 없습니다.</p>}
                </div>
              )}
            </div>

            {/* 알림 */}
            <button onClick={() => navigate("/mypage/mymessage")} className="btn-ghost p-2 rounded-full relative" aria-label="알림">
              <FiBell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && <span className="badge bg-red-500 text-white absolute -top-0.5 -right-0.5 text-[10px] min-w-[16px] h-4">{unreadCount}</span>}
            </button>

            {/* 채팅 */}
            <button className="btn-ghost p-2 rounded-full" aria-label="채팅">
              <FiMessageSquare className="w-5 h-5 text-gray-500" />
            </button>

            {/* 계정 드롭다운 (데스크탑) */}
            <div className="relative hidden md:block" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="btn-ghost p-2 rounded-full" aria-label="계정">
                <FiUser className="w-5 h-5 text-gray-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50">
                  {userRoutes.map(({ to, name, auth, icon }) =>
                    isAuth === auth ? (
                      <button
                        key={name}
                        onClick={() => {
                          if (name === "로그아웃") {
                            handleLogout();
                          } else {
                            navigate(to);
                            setMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      >
                        {icon}
                        {name}
                      </button>
                    ) : null,
                  )}
                </div>
              )}
            </div>

            {/* 햄버거 (모바일) */}
            <button onClick={() => setDrawerOpen(true)} className="md:hidden btn-ghost p-2 rounded-full" aria-label="메뉴">
              <FiMenu className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 모바일 Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex">
          {/* 오버레이 */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          {/* 사이드 패널 */}
          <div className="w-72 bg-white h-full flex flex-col shadow-2xl animate-[slideInRight_0.25s_ease]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src="/logo/khaki_long_h.png" alt="Clubing" className="h-9" />
              <button onClick={() => setDrawerOpen(false)} className="btn-ghost p-1 rounded-full">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* 메뉴 링크 */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-[15px] font-hanbit transition-colors
                    ${selected === item.name ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* 로그인/로그아웃 버튼 */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-1">
              {userRoutes.map(({ to, name, auth, icon }) =>
                isAuth === auth ? (
                  <button
                    key={name}
                    onClick={() => {
                      if (name === "로그아웃") {
                        handleLogout();
                      } else {
                        navigate(to);
                        setDrawerOpen(false);
                      }
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                  >
                    {icon}
                    {name}
                  </button>
                ) : null,
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
