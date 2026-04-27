import React, { useState, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import CKEditor5Editor    from "../../../components/club/ClubBoardEditor";
import VoteCreationForm   from "../../../components/club/ClubVote";
import ListPosts          from "./BoardList";
import { useSelector }    from "react-redux";
import { useLocation }    from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { checkMembership, savePost, saveVote } from "../../../api/ClubBoardApi";

const Board = () => {
  const [open,          setOpen]          = useState(false);
  const [editorData,    setEditorData]    = useState("");
  const [title,         setTitle]         = useState("");
  const [category,      setCategory]      = useState("");
  const [image,         setImage]         = useState("");
  const [options,       setOptions]       = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous,     setAnonymous]     = useState(false);
  const [endTime,       setEndTime]       = useState("");
  const [isMember,      setIsMember]      = useState(false);
  const [toast,         setToast]         = useState({ open: false, msg: "", ok: true });

  const location     = useLocation();
  const clubNumber   = new URLSearchParams(location.search).get("clubNumber");
  const author       = useSelector((s) => s.user?.userData?.user?.email || null);
  const queryClient  = useQueryClient();

  const showToast = (msg, ok = true) => {
    setToast({ open: true, msg, ok });
    setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000);
  };

  useEffect(() => {
    if (author && clubNumber)
      checkMembership(clubNumber, author).then(setIsMember).catch(() => setIsMember(false));
  }, [author, clubNumber]);

  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  const handleSave = async () => {
    if (!title || !category || !editorData) { showToast("모든 필드를 입력해주세요.", false); return; }
    try {
      await savePost({ clubNumber, create_at: getCurrentDate(), author, title, category, content: editorData });
      queryClient.invalidateQueries(["posts"]); // 목록 캐시 무효화 → 즉시 재조회
      showToast("게시글이 등록되었습니다.");
      handleClose();
    } catch { showToast("게시글 저장에 실패했습니다.", false); }
  };

  const handleVoteSave = async () => {
    if (!title || !category || options.some((o) => !o.trim()) || !endTime) { showToast("모든 필드를 입력해주세요.", false); return; }
    try {
      await saveVote({ clubNumber, create_at: getCurrentDate(), author, title, category, options, allowMultiple, anonymous, endTime });
      queryClient.invalidateQueries(["posts"]); // 목록 캐시 무효화 → 즉시 재조회
      showToast("투표가 등록되었습니다.");
      handleClose();
    } catch { showToast("투표 저장에 실패했습니다.", false); }
  };

  const handleClose = () => {
    setOpen(false);
    if (category === "투표") { setTitle(""); setCategory(""); setOptions(["",""]); setAllowMultiple(false); setAnonymous(false); setEndTime(""); }
    else                     { setTitle(""); setCategory(""); setEditorData(""); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-4">
      {/* Extended FAB */}
      {isMember && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-10 right-10 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-xl transition-all duration-200 text-sm font-nanum-bold"
          aria-label="글쓰기"
        >
          <FiPlus className="w-4 h-4 flex-shrink-0" />
          글쓰기
        </button>
      )}

      <ListPosts />

      {/* 토스트 */}
      {toast.open && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-xl shadow-lg text-sm font-nanum text-white ${toast.ok ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* 글쓰기 모달 */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-nanum-bold text-gray-900">글쓰기</h2>
              <button onClick={handleClose} className="btn-ghost p-1 rounded-full"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {category === "투표"
                ? <VoteCreationForm title={title} setTitle={setTitle} category={category} setCategory={setCategory} options={options} setOptions={setOptions} allowMultiple={allowMultiple} setAllowMultiple={setAllowMultiple} anonymous={anonymous} setAnonymous={setAnonymous} endTime={endTime} setEndTime={setEndTime} />
                : <CKEditor5Editor onChange={setEditorData} title={title} setTitle={setTitle} category={category} setCategory={setCategory} setImage={setImage} />
              }
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={handleClose} className="btn-outline px-5">닫기</button>
              <button onClick={category === "투표" ? handleVoteSave : handleSave} className="btn-primary px-5">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
