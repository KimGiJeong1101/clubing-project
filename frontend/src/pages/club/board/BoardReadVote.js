import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiMessageSquare } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVote, fetchVoteSummary, voteForOption, removeVote, deleteVote } from "../../../api/ClubBoardApi";
import Reply from "./Reply"; // 댓글 컴포넌트 추가

const ReadVote = ({ voteId, onDelete }) => {
  const [vote, setVote] = useState(null);
  const [summary, setSummary] = useState([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [votedOptions, setVotedOptions] = useState([]);
  const [isVoteEnded, setIsVoteEnded] = useState(false);
  const [openReply, setOpenReply] = useState(false); // 댓글 컴포넌트 열기 상태
  const queryClient = useQueryClient();

  const email = useSelector((state) => state.user?.userData?.user?.email || null);

  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        const voteData = await fetchVote(voteId);
        setVote(voteData);

        const currentTime = new Date();
        const endTime = new Date(voteData.endTime);
        setIsVoteEnded(currentTime > endTime);

        const summaryData = await fetchVoteSummary(voteId);
        setSummary(summaryData);

        const userHasVoted = voteData.votes.some((vote) => vote.emails.includes(email));
        setHasVoted(userHasVoted);

        const votedOptionsList = voteData.votes.filter((vote) => vote.emails.includes(email)).map((vote) => vote.option);
        setVotedOptions(votedOptionsList);

        setIsAuthor(voteData.author === email);
      } catch (error) {
        console.error("투표 데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchVoteData();
  }, [voteId, email]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteVote(voteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      if (onDelete) onDelete();
    },
    onError: (error) => {
      console.error("투표 삭제 중 오류 발생:", error);
    },
  });

  const voteMutation = useMutation({
    mutationFn: () => voteForOption(voteId, selectedOption, email),
    onSuccess: () => {
      setHasVoted(true);
      setVotedOptions([...votedOptions, selectedOption]);

      const updatedSummary = summary.map((item) => (item.option === selectedOption ? { ...item, count: item.count + 1 } : item));
      setSummary(updatedSummary);

      setIsVoteEnded(true);
    },
    onError: (error) => {
      console.error("투표하기 중 오류 발생:", error);
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: () => removeVote(voteId, selectedOption, email),
    onSuccess: async () => {
      setHasVoted(false);
      setSelectedOption(null);
      setVotedOptions(votedOptions.filter((option) => option !== selectedOption));

      const updatedSummary = await fetchVoteSummary(voteId);
      setSummary(updatedSummary);
    },
    onError: (error) => {
      console.error("투표 취소 중 오류 발생:", error);
    },
  });

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      voteMutation.mutate();
    }
  };

  const handleRemoveVote = () => {
    if (selectedOption && hasVoted) {
      removeVoteMutation.mutate();
    }
  };

  const handleOptionClick = (option) => {
    if (!hasVoted) {
      setSelectedOption(option);
    }
  };

  const handleSummaryOpen = async () => {
    try {
      const summaryData = await fetchVoteSummary(voteId);
      setSummary(summaryData);
      setOpenSummary(true);
    } catch (error) {
      console.error("투표 요약 정보를 가져오는 중 오류 발생:", error);
    }
  };

  const handleSummaryClose = () => {
    setOpenSummary(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const formatToLocalDatetime = (dateString) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const handleToggleReply = () => setOpenReply((prev) => !prev); // 댓글 컴포넌트 열기/닫기

  return (
    <div className="max-w-4xl mx-auto px-4">
      {vote && (
        <>
          <div className="p-4">
            {/* 투표 제목 (읽기 전용) */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">투표 제목</label>
              <input
                type="text"
                value={vote.title}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-default"
              />
            </div>

            {/* 투표 옵션 목록 (투표 전, 종료 전) */}
            {!hasVoted && !isVoteEnded && (
              <ul className="space-y-2 mb-4">
                {vote.options.map((option, index) => {
                  return (
                    <li
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      className={`flex items-center border rounded px-3 py-2 cursor-pointer transition-colors ${
                        selectedOption === option
                          ? "border-[#A67153] bg-[#f5ede6]"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm">{option}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* 버튼 영역 */}
            <div className="flex flex-wrap gap-2 my-4">
              {!isVoteEnded ? (
                <>
                  {!hasVoted ? (
                    <button
                      onClick={handleVote}
                      disabled={!selectedOption}
                      className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      투표하기
                    </button>
                  ) : (
                    <button
                      onClick={handleSummaryOpen}
                      className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                    >
                      투표 결과 보기
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleSummaryOpen}
                  className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                >
                  투표 결과 보기
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  투표 삭제
                </button>
              )}
            </div>

            {/* 투표 종료 시간 (읽기 전용) */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">투표 종료 시간</label>
              <input
                type="datetime-local"
                value={formatToLocalDatetime(vote.endTime)}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-default"
              />
            </div>
          </div>

          {/* 댓글 토글 버튼 */}
          <div className="flex justify-end w-full pr-4">
            <button onClick={handleToggleReply} className="text-gray-400 hover:text-gray-600 transition-colors mr-3">
              <FiMessageSquare size={28} />
            </button>
          </div>

          {/* 댓글 컴포넌트를 ReadVote 위치에 렌더링 */}
          {openReply && (
            <div className="p-4">
              <Reply postType="Board" postId={voteId} />
            </div>
          )}

          {/* 투표 결과 모달 */}
          {openSummary && (
            <div
              className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4"
              onClick={handleSummaryClose}
            >
              <div
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">투표 결과</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {summary.map((item, index) => (
                      <li key={index} className="flex flex-col border-b pb-2 last:border-0">
                        <span className="font-medium text-sm">{item.option}</span>
                        <span className="text-xs text-gray-500">선택 수: {item.count}</span>
                        {!vote.anonymous && (
                          <span className="text-xs text-gray-400">투표한 사람: {item.emails}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleSummaryClose}
                    className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadVote;
