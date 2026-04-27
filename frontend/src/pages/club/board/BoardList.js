import React, { useState, useEffect } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPosts } from "../../../api/ClubBoardApi";
import Read from "./BoardRead";
import ReadVote from "./BoardReadVote";

const CATEGORIES = ["전체", "공지사항(전체알림)", "자유글", "관심사공유", "모임후기", "가입인사", "투표"];
const LIMIT = 12;

const ListPosts = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCat, setSelectedCat] = useState("");
  const [filterCat, setFilterCat] = useState("전체");
  const [dialogTitle, setDialogTitle] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const clubNumber = new URLSearchParams(location.search).get("clubNumber");

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", clubNumber, currentPage],
    queryFn: () => fetchPosts(clubNumber, currentPage, LIMIT),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data) setTotalPages(data.totalPages);
  }, [data]);

  const items = (data?.boards || []).filter((item) => filterCat === "전체" || item.category === filterCat);

  const handleSelect = (id, cat, title) => {
    setSelectedId(id);
    setSelectedCat(cat);
    setDialogTitle(title);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedId(null);
    setSelectedCat("");
    setDialogTitle("");
  };

  const handleArrow = (e, id, cat) => {
    e.stopPropagation();
    navigate(cat === "투표" ? `vote/${id}?clubNumber=${clubNumber}` : `read/${id}?clubNumber=${clubNumber}`);
  };

  const truncate = (t, n) => (t.length > n ? t.slice(0, n) + "…" : t);

  if (isLoading) return <p className="text-center py-8 text-gray-400">로딩 중...</p>;
  if (error) return <p className="text-center py-8 text-red-400">오류: {error.message}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mt-4 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors font-nanum
              ${filterCat === cat ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300 text-gray-600 hover:bg-primary-50 hover:border-primary-300"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="min-h-[400px]">
        {items.length === 0 ? (
          <p className="text-center py-16 text-gray-400 text-sm">게시물이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item._id} onClick={() => handleSelect(item._id, item.category, item.title)} className="flex items-center justify-between px-2 py-3.5 cursor-pointer hover:bg-primary-50 rounded-xl transition-colors">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-nanum text-gray-900 truncate">{truncate(item.title, 45)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.category || "투표"}
                    {item.endTime ? ` · 종료: ${new Date(item.endTime).toLocaleString()}` : ""}
                  </p>
                </div>
                <button onClick={(e) => handleArrow(e, item._id, item.category)} className="text-gray-400 hover:text-primary-600 transition-colors p-1">
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-6">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-primary-50 transition-colors text-sm">
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition-colors
                ${p === currentPage ? "bg-primary-600 border-primary-600 text-white" : "border-gray-200 text-gray-600 hover:bg-primary-50"}`}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-primary-50 transition-colors text-sm">
            ›
          </button>
        </div>
      )}

      {/* 게시글 상세 모달 */}
      {openDialog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-nanum-bold text-gray-900 truncate pr-4">{selectedCat !== "투표" ? dialogTitle : "투표"}</h2>
              <button onClick={handleClose} className="btn-ghost p-1 rounded-full flex-shrink-0">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{selectedCat === "투표" ? <ReadVote voteId={selectedId} title={dialogTitle} onDelete={handleClose} /> : <Read postId={selectedId} title={dialogTitle} onClose={handleClose} />}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPosts;
