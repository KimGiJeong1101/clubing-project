import React from "react";
import { FiInfo } from "react-icons/fi";
import ClubListCard from "../../components/club/ClubListCard.js";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchClubs = async ({ pageParam = 1, email }) => {
  const response = await axios.get(`http://localhost:4000/clubs/recommend/scroll/${pageParam}`, {
    params: { email },
  });
  return response.data;
};

const ClubsList = () => {
  const email = useSelector((state) => state.user?.userData?.user?.email || null);

  const {
    data: clubList = [],
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["clubList", email],
    queryFn: ({ pageParam = 1 }) => fetchClubs({ pageParam, email }),
    getNextPageParam: (lastPage, allPages) => (lastPage.length ? allPages.length + 1 : undefined),
    keepPreviousData: true,
  });

  const loadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, loadMore]);

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const tooltipText = email ? `선택한 지역 및 관심사 기준으로 추천해드립니다. 지역 및 관심사 변경은 마이페이지-회원정보-정보수정 에서 가능합니다.` : `선택한 지역 및 관심사 기준으로 추천해드립니다. 로그인 시 정확한 추천 정보를 받을 수 있습니다.`;

  return (
    <div className="w-full pt-5 bg-[#F2F2F2] relative">
      <div className="max-w-screen-lg mx-auto pb-10 px-4">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <h2 className="text-xl font-semibold">지역기반 추천</h2>
          {/* 툴팁 (hover 방식) */}
          <div className="relative group ml-1">
            <button className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <FiInfo size={22} />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 hidden group-hover:block bg-black/70 text-white text-xs rounded px-3 py-2 w-64 whitespace-pre-line">{tooltipText}</div>
          </div>
        </div>

        {/* 클럽 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ClubListCard clubList={clubList.pages ? clubList.pages.flat() : []} />
        </div>

        {isLoading && <div>더 로딩 중...</div>}
      </div>
    </div>
  );
};

export default ClubsList;
