import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";
import Reply from "./Reply"; // 댓글 컴포넌트 추가

const ReadVote = ({ voteId, onDelete }) => {
  const { id } = useParams(); // URL 파라미터에서 게시물 ID 가져오기
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  const [vote, setVote] = useState(null);
  const [summary, setSummary] = useState([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [votedOptions, setVotedOptions] = useState([]);
  const [isVoteEnded, setIsVoteEnded] = useState(false);
  const queryClient = useQueryClient();

  const email = useSelector((state) => state.user?.userData?.user?.email || null);

  useEffect(() => {
    const fetchVote = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/clubs/boards/votes/${id}`);
        setVote(response.data);

        // Determine if the vote has ended
        const currentTime = new Date();
        const endTime = new Date(response.data.endTime);
        setIsVoteEnded(currentTime > endTime);

        const summaryResponse = await axios.get(`http://localhost:4000/clubs/boards/votes/${id}/summary`);
        setSummary(summaryResponse.data);

        const userHasVoted = response.data.votes.some((vote) => vote.emails.includes(email));
        setHasVoted(userHasVoted);

        const votedOptions = response.data.votes.filter((vote) => vote.emails.includes(email)).map((vote) => vote.option);
        setVotedOptions(votedOptions);

        setIsAuthor(response.data.author === email);
      } catch (error) {
        console.error("투표를 가져오는 중 오류 발생:", error);
      }
    };

    fetchVote();
  }, [id, email]);

  const { mutate: deleteVote } = useMutation({
    mutationFn: async () => {
      await axios.delete(`http://localhost:4000/clubs/boards/votes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      if (onDelete) onDelete();
    },
    onError: (error) => {
      console.error("투표 삭제 중 오류 발생:", error);
    },
  });

  const formatToLocalDatetime = (dateString) => {
    const date = new Date(dateString);
    // 로컬 시간대로 변환
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    // yyyy-MM-ddTHH:mm 형식으로 변환
    return localDate.toISOString().slice(0, 16);
  };

  const handleVote = async () => {
    if (selectedOption && !hasVoted) {
      try {
        await axios.post(`http://localhost:4000/clubs/boards/votes/${id}/vote`, { option: selectedOption, email });
        setHasVoted(true);
        setVotedOptions([...votedOptions, selectedOption]);

        const updatedSummary = summary.map((item) => (item.option === selectedOption ? { ...item, count: item.count + 1 } : item));
        setSummary(updatedSummary);
      } catch (error) {
        console.error("Error updating vote count:", error);
      }
    }
  };

  const handleOptionClick = (option) => {
    if (!hasVoted) {
      setSelectedOption(option);
    }
  };

  const handleSummaryOpen = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/clubs/boards/votes/${id}/summary`);
      setSummary(response.data);
      setOpenSummary(true);
    } catch (error) {
      console.error("Error fetching vote summary:", error);
    }
  };

  const handleSummaryClose = () => {
    setOpenSummary(false);
  };

  const handleRemoveVote = async () => {
    if (selectedOption && hasVoted) {
      try {
        await axios.put(`http://localhost:4000/clubs/boards/votes/${id}`, {
          option: selectedOption,
          email,
        });

        setHasVoted(false);
        setSelectedOption(null);
        setVotedOptions(votedOptions.filter((option) => option !== selectedOption));

        const updatedSummaryResponse = await axios.get(`http://localhost:4000/clubs/boards/votes/${id}/summary`);
        setSummary(updatedSummaryResponse.data);
      } catch (error) {
        console.error("투표 취소 중 오류 발생:", error);
      }
    }
  };

  const handleDelete = () => {
    deleteVote();
  };

  const postType = "Board"; // 포스트 타입

  console.log("vote:", vote);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">투표 내용</h1>
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
                  const count = summary.find((item) => item.option === option)?.count || 0;
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
                      onClick={handleRemoveVote}
                      className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                    >
                      투표 취소하기
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

            {/* 댓글 컴포넌트 */}
            <div className="p-2">
              <Reply postType={postType} postId={id} />
            </div>
          </div>
        </>
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
                    {/* anonymous가 true일 때 투표한 사람 부분 숨기기 */}
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
    </div>
  );
};

export default ReadVote;
