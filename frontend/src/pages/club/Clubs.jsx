import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { throttle } from "lodash";
import { FiSearch, FiX, FiPlus, FiUsers } from "react-icons/fi";
import {
  MdFastfood, MdMenuBook, MdNightlife, MdCelebration, MdSportsKabaddi,
  MdColorLens, MdLocalAtm, MdFavorite, MdLocalAirport, MdPeople, MdAutoStories,
} from "react-icons/md";
import { IoBoatOutline } from "react-icons/io5";
import ClubListCard from "../../components/club/ClubListCard.js";

const CATEGORIES = [
  { color: "#71ABF0", icon: <MdFastfood    className="w-7 h-7" />, text: "푸드·드링크" },
  { color: "#DC6A5A", icon: <MdMenuBook    className="w-7 h-7" />, text: "자기계발" },
  { color: "#9363D1", icon: <MdNightlife   className="w-7 h-7" />, text: "취미" },
  { color: "#6BAED4", icon: <IoBoatOutline className="w-7 h-7" />, text: "액티비티" },
  { color: "#EE7E8C", icon: <MdCelebration className="w-7 h-7" />, text: "파티" },
  { color: "#5C6BC0", icon: <MdSportsKabaddi className="w-7 h-7" />, text: "소셜게임" },
  { color: "#F4A836", icon: <MdColorLens   className="w-7 h-7" />, text: "문화·예술" },
  { color: "#C25BA1", icon: <MdLocalAtm    className="w-7 h-7" />, text: "N잡·재테크" },
  { color: "#E8727E", icon: <MdFavorite    className="w-7 h-7" />, text: "연애·사랑" },
  { color: "#5BAD6F", icon: <MdLocalAirport className="w-7 h-7" />, text: "여행·나들이" },
  { color: "#7986CB", icon: <MdPeople      className="w-7 h-7" />, text: "동네·또래" },
  { color: "#8E44AD", icon: <MdAutoStories className="w-7 h-7" />, text: "외국어" },
];

/* ── 스켈레톤 카드 ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-1">
            {[0,1,2].map(i=><div key={i} className="w-7 h-7 rounded-full bg-gray-200"/>)}
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-200"/>
        </div>
      </div>
    </div>
  );
}

const Clubs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [category,     setCategory]     = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [scrollCount,  setScrollCount]  = useState(1);
  const [scrollData,   setScrollData]   = useState([]);
  const [toast,        setToast]        = useState({ open: false, msg: "" });

  useEffect(() => {
    if (location.state?.snackbarMessage) {
      setToast({ open: true, msg: location.state.snackbarMessage });
      setTimeout(() => setToast({ open: false, msg: "" }), 4000);
    }
  }, [location]);

  const getClubList = async () => {
    const url = category
      ? `http://localhost:4000/clubs/${category}?searchRegion=${searchRegion}`
      : `http://localhost:4000/clubs?searchRegion=${searchRegion}`;
    const res = await fetch(url);
    return res.json();
  };

  const { data: clubList = [], isLoading, isError, error } = useQuery({
    queryKey: ["clubList", category, searchRegion],
    queryFn:  getClubList,
    keepPreviousData: true,
  });

  const getClubListScroll = async (count) => {
    const url = category
      ? `http://localhost:4000/clubs/scroll/${count}/${category}?searchRegion=${searchRegion}`
      : `http://localhost:4000/clubs/scroll/${count}?searchRegion=${searchRegion}`;
    const res  = await fetch(url);
    const data = await res.json();
    setScrollData((p) => [...p, ...data]);
    if (data.length !== 6) window.removeEventListener("scroll", handleScroll);
    else window.addEventListener("scroll", handleScroll);
  };

  const handleScroll = useCallback(
    throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        setScrollCount((p) => { getClubListScroll(p + 1); return p + 1; });
        window.removeEventListener("scroll", handleScroll);
      }
    }, 500),
    [category, searchRegion],
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [category, searchRegion]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleRegionClick = () => {
    setScrollData([]); setScrollCount(1);
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setSearchRegion(addr.split(" ")[1]);
      },
    }).open();
  };

  const handleCategoryClick = (text) => {
    setScrollData([]); setScrollCount(1);
    setCategory((prev) => (prev === text ? "" : text));
  };

  const allClubs = [...clubList, ...scrollData];

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* 토스트 */}
      {toast.open && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[400] bg-white text-primary-600 font-nanum-bold px-6 py-3 rounded-2xl shadow-xl border border-primary-100 animate-fade-in">
          {toast.msg}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate("/clubs/create")}
        className="fixed bottom-10 right-10 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all duration-200"
        aria-label="모임 만들기"
      >
        <FiPlus className="w-6 h-6" />
      </button>

      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs text-primary-500 font-nanum-bold tracking-widest uppercase mb-1">CLUBING</p>
              <h1 className="text-2xl font-nanum-bold text-gray-900">모임 찾기</h1>
              <p className="text-sm text-gray-400 mt-1">관심사와 지역으로 딱 맞는 모임을 찾아보세요</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
              <FiUsers className="w-4 h-4" />
              <span>{allClubs.length}개의 모임</span>
            </div>
          </div>

          {/* ── 카테고리 아이콘 그리드 ── */}
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 md:gap-3">
            {CATEGORIES.map((item) => {
              const isActive = category === item.text;
              return (
                <button
                  key={item.text}
                  onClick={() => handleCategoryClick(item.text)}
                  className={`flex flex-col items-center gap-1.5 group transition-transform active:scale-95
                    ${isActive ? "scale-105" : "hover:scale-105"}`}
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-200 shadow-sm
                      ${isActive ? "shadow-lg ring-2 ring-offset-2 ring-primary-400 scale-105" : "hover:shadow-md"}`}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <span className={`text-[10px] md:text-xs text-center leading-tight whitespace-nowrap transition-colors
                    ${isActive ? "text-primary-600 font-nanum-bold" : "text-gray-500 font-nanum"}`}>
                    {item.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── 지역 검색 버튼 ── */}
          <button
            onClick={handleRegionClick}
            className="mt-5 w-full flex items-center justify-between bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-2xl px-5 py-3 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center transition-colors">
                <FiSearch className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-nanum-bold text-gray-700">지역으로 모임 찾기</p>
                <p className="text-xs text-gray-400">
                  {searchRegion ? `현재 지역: ${searchRegion}` : "카테고리와 지역을 함께 선택해보세요"}
                </p>
              </div>
            </div>
            <span className="text-xs text-primary-500 font-nanum-bold group-hover:underline">선택하기 →</span>
          </button>
        </div>
      </div>

      {/* ── 클럽 목록 ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-20">

        {/* 활성 필터 chips */}
        {(searchRegion || category) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {searchRegion && (
              <span className="inline-flex items-center gap-1.5 bg-white text-primary-700 font-nanum-bold px-4 py-1.5 rounded-full shadow-sm border border-primary-100 text-sm">
                📍 {searchRegion}
                <button
                  onClick={() => { setSearchRegion(""); setScrollData([]); setScrollCount(1); }}
                  className="hover:text-red-400 transition-colors ml-0.5"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 bg-white text-primary-700 font-nanum-bold px-4 py-1.5 rounded-full shadow-sm border border-primary-100 text-sm">
                {category}
                <button
                  onClick={() => { setCategory(""); setScrollData([]); setScrollCount(1); }}
                  className="hover:text-red-400 transition-colors ml-0.5"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* 결과 섹션 */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-gray-500 text-sm">모임을 불러오는 중 오류가 발생했어요</p>
            <p className="text-xs text-gray-400 mt-1">{error?.message}</p>
          </div>
        ) : allClubs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="font-nanum-bold text-gray-700 mb-1">모임이 없어요</p>
            <p className="text-sm text-gray-400">다른 카테고리나 지역으로 검색해보세요</p>
            {(category || searchRegion) && (
              <button
                onClick={() => { setCategory(""); setSearchRegion(""); setScrollData([]); setScrollCount(1); }}
                className="mt-4 px-5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-nanum-bold rounded-xl transition-colors"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ClubListCard clubList={allClubs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
