import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FiInfo, FiChevronLeft, FiChevronRight, FiCalendar, FiGift, FiArrowRight } from "react-icons/fi";
import HomeCard from "../../components/commonEffect/HomeCard";

const images = ["/MainImage/mainImage.webp", "/MainImage/mainImage2.webp", "/MainImage/mainImage3.webp"];

const bannerTexts = [
  { title: "취미로 연결되는 사람들", sub: "관심사가 같은 모임을 지금 찾아보세요" },
  { title: "함께라서 더 즐거운 일상", sub: "다양한 활동으로 새로운 인연을 만나요" },
  { title: "당신의 모임을 직접 만들어요", sub: "누구나 모임장이 될 수 있습니다" },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 30 } },
  exit: (dir) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0, transition: { duration: 0.3 } }),
};

const fetchCardData = () => axios.get("http://localhost:4000/clubs/home/card").then((r) => r.data);
const fetchNewClubsData = () => axios.get("http://localhost:4000/clubs/home/card/new").then((r) => r.data);
const fetchRecommendedClubs = (email) => axios.get("http://localhost:4000/clubs/home/recommend", { params: { email } }).then((r) => r.data);

/* ── 섹션 헤더 ── */
function SectionHeader({ title, onMore, tooltip, accent }) {
  const [tip, setTip] = useState(false);
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {accent && <span className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #a6836f, #dbc7b5)" }} />}
        <h2 className="text-xl font-nanum-bold text-gray-800">{title}</h2>
        {tooltip && (
          <div className="relative">
            <button onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} className="text-gray-300 hover:text-gray-500 transition-colors p-0.5">
              <FiInfo className="w-3.5 h-3.5" />
            </button>
            {tip && <div className="absolute left-1/2 -translate-x-1/2 top-7 w-64 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 z-10 shadow-xl whitespace-pre-line leading-relaxed">{tooltip}</div>}
          </div>
        )}
      </div>
      {onMore && (
        <button onClick={onMore} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors group">
          더보기
          <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

/* ── 스켈레톤 카드 ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const email = useSelector((s) => s.user?.userData?.user?.email || null);

  const [[page, direction], setPage] = useState([0, 0]);
  const [rotation, setRotation] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const imageIndex = (p) => ((p % images.length) + images.length) % images.length;
  const nextImage = () => setPage(([p]) => [p + 1, 1]);
  const prevImage = () => setPage(([p]) => [p - 1, -1]);

  useEffect(() => {
    const t = setInterval(nextImage, 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (carouselPaused) return;
    const t = setInterval(() => setRotation((r) => r + 20), 3000);
    return () => clearInterval(t);
  }, [carouselPaused]);

  const { data: clubsData, isLoading: loadingClubs } = useQuery({ queryKey: ["clubData"], queryFn: fetchCardData });
  const { data: newClubsData, isLoading: loadingNew } = useQuery({ queryKey: ["newClubData"], queryFn: fetchNewClubsData });
  const { data: recommendedData, isLoading: loadingRec } = useQuery({
    queryKey: ["recommendedClubs", email],
    queryFn: () => fetchRecommendedClubs(email),
  });

  const tooltipText = email ? "선택한 지역 및 관심사 기준으로 추천해드립니다.\n지역 및 관심사 변경은 마이페이지 → 회원정보 → 정보수정에서 가능합니다." : "선택한 지역 및 관심사 기준으로 추천합니다.\n로그인 시 더 정확한 추천을 받을 수 있어요.";

  const curIdx = imageIndex(page);

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>
      <div className="max-w-6xl mx-auto pb-20">
        {/* ── 히어로 캐러셀 ── */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/7" }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.img key={page} src={images[curIdx]} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 w-full h-full object-cover" alt="메인 배너" />
          </AnimatePresence>

          {/* 전체 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* 배너 텍스트 */}
          <div className="absolute bottom-10 left-10 text-white">
            <AnimatePresence mode="wait">
              <motion.div key={curIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}>
                <p className="text-sm font-nanum tracking-wider text-white/70 mb-1">CLUBING</p>
                <h1 className="text-3xl md:text-4xl font-nanum-bold drop-shadow-lg mb-2">{bannerTexts[curIdx].title}</h1>
                <p className="text-sm md:text-base text-white/80 drop-shadow">{bannerTexts[curIdx].sub}</p>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => navigate("/clubList")} className="mt-5 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white text-sm font-nanum-bold px-5 py-2 rounded-full transition-all">
              모임 찾아보기 <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 화살표 */}
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white rounded-full p-2.5 transition-all">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white rounded-full p-2.5 transition-all">
            <FiChevronRight className="w-5 h-5" />
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
            {images.map((_, i) => (
              <button key={i} onClick={() => setPage([i, i > curIdx ? 1 : -1])} className={`block h-1.5 rounded-full transition-all duration-300 ${curIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`} />
            ))}
          </div>
        </div>

        {/* ── 콘텐츠 패딩 영역 ── */}
        <div className="px-4 md:px-6">
          {/* ── 모임 찾기 ── */}
          <section className="mt-12">
            <SectionHeader title="모임 찾기" onMore={() => navigate("/clubList")} accent />
            {loadingClubs ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {clubsData?.map((club, i) => (
                  <HomeCard key={i} club={club} />
                ))}
              </div>
            )}
          </section>

          {/* ── 신규 모임 (3D 캐러셀) ── */}
          <section className="mt-14">
            <SectionHeader title="신규 모임" accent />
            <div className="relative flex justify-center items-center overflow-hidden rounded-2xl" style={{ height: "420px", background: "linear-gradient(135deg, #f5ede6 0%, #ece4dc 100%)", perspective: "1400px" }} onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)}>
              {/* 배경 장식 원형 링 */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute rounded-full border border-primary-400" style={{ width: `${100 + i * 80}px`, height: `${100 + i * 80}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
                ))}
              </div>

              <div
                className="relative"
                style={{
                  width: "200px",
                  height: "200px",
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${rotation}deg)`,
                  transition: carouselPaused ? "transform 0.6s ease-out" : "transform 10s ease",
                }}
              >
                {newClubsData?.map((club, i) => {
                  const total = newClubsData.length || 1;
                  const angle = (i / total) * 360;
                  const radius = Math.max(260, total * 38);
                  const imgUrl = club.img ? `http://localhost:4000/${club.img}` : "https://via.placeholder.com/200";
                  return (
                    <div
                      key={i}
                      className="absolute cursor-pointer group"
                      style={{
                        width: "200px",
                        height: "160px",
                        top: "50%",
                        left: "50%",
                        marginTop: "-80px",
                        marginLeft: "-100px",
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        backfaceVisibility: "hidden",
                      }}
                      onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
                    >
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/70 bg-white transition-transform duration-200 group-hover:scale-105">
                        <img src={imgUrl} alt={club.title} className="w-full h-[110px] object-cover" />
                        <div className="px-3 py-2">
                          <p className="text-xs font-nanum-bold text-gray-800 truncate">{club.title}</p>
                          <p className="text-[11px] text-primary-400 truncate mt-0.5">{club.mainCategory}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-5 text-center">
                <p className="text-xs text-primary-500/60 font-nanum">새로 생긴 모임을 만나보세요</p>
              </div>
            </div>
          </section>

          {/* ── 추천 모임 ── */}
          <section className="mt-14">
            <SectionHeader title="추천 모임" onMore={() => navigate("/recommendedClubList")} tooltip={tooltipText} accent />
            {loadingRec ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
              </div>
            ) : recommendedData?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recommendedData.map((club, i) => (
                  <HomeCard key={i} club={club} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-14 text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🏕️</span>
                </div>
                <p className="text-gray-500 text-sm">{email ? "아직 추천 모임이 없어요. 관심사를 설정해보세요!" : "로그인하면 맞춤 모임을 추천해드려요"}</p>
                <button onClick={() => navigate(email ? "/mypage" : "/login")} className="mt-4 text-sm text-primary-600 hover:underline font-nanum-bold">
                  {email ? "관심사 설정하러 가기 →" : "로그인하기 →"}
                </button>
              </div>
            )}
          </section>

          {/* ── 정모일정 ── */}
          <section className="mt-14">
            <SectionHeader title="정모일정" onMore={() => navigate("/meetingList")} accent />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-14 text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                <FiCalendar className="w-7 h-7 text-orange-300" />
              </div>
              <p className="text-sm font-nanum-bold text-gray-600 mb-1">가까운 정모가 없어요</p>
              <p className="text-xs text-gray-400">모임에 가입하면 정모 일정이 여기 표시됩니다</p>
              <button onClick={() => navigate("/clubList")} className="mt-5 px-5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-nanum-bold rounded-xl transition-colors">
                모임 찾으러 가기
              </button>
            </div>
          </section>

          {/* ── 이벤트 ── */}
          <section className="mt-14">
            <SectionHeader title="이벤트" onMore={() => navigate("/event")} accent />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-14 text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                <FiGift className="w-7 h-7 text-rose-300" />
              </div>
              <p className="text-sm font-nanum-bold text-gray-600 mb-1">진행 중인 이벤트가 없어요</p>
              <p className="text-xs text-gray-400">새로운 이벤트가 생기면 알려드릴게요</p>
              <button onClick={() => navigate("/event")} className="mt-5 px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 text-sm font-nanum-bold rounded-xl transition-colors">
                이벤트 전체보기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
