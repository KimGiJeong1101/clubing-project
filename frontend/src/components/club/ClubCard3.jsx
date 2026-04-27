import React from "react";
import { FiUsers, FiMessageCircle, FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { makeEnterChat } from "../../store/actions/chatActions.js";

/* ── 타임스탬프 → 상대 시간 포맷 ── */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now - target;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;

  // 어제 / 날짜
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((nowDate - targetDate) / 86400000);
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;

  // 올해면 월/일, 아니면 연도 포함
  if (target.getFullYear() === now.getFullYear()) {
    return `${target.getMonth() + 1}/${target.getDate()}`;
  }
  return `${target.getFullYear()}.${String(target.getMonth() + 1).padStart(2, "0")}.${String(target.getDate()).padStart(2, "0")}`;
};

/* ── 메시지 미리보기 텍스트 ── */
const formatMessagePreview = (msg) => {
  if (!msg) return "아직 메시지가 없습니다.";
  if (msg.images && msg.images.length > 0) {
    return msg.content?.trim() ? msg.content : "📷 사진";
  }
  return msg.content || "아직 메시지가 없습니다.";
};

const ClubCard3 = ({ clubList }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData?.user || {});
  const userId = useSelector((state) => state.user?.userData?.user?._id);

  const handleClickChat = async (clubId) => {
    try {
      if (!userId) return;
      const actionResult = await dispatch(makeEnterChat({ clubId, participants: [userId] }));
      const chattingRoom = actionResult.payload;
      if (!chattingRoom) throw new Error("채팅방 정보를 불러오는 데 실패했습니다.");
      navigate(`/clubs/chat?clubNumber=${clubId}`);
    } catch (error) {
      console.error("Error entering chat room:", error.message || error);
    }
  };

  return (
    <div className="space-y-2">
      {clubList.map((item) => {
        const preview = formatMessagePreview(item.latestMessage);
        const timeLabel = formatRelativeTime(item.latestMessage?.timestamp);
        const isAdmin = item.admin === user.email;

        return (
          <div key={item._id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden flex items-center cursor-pointer transition-all duration-200 border border-gray-100 hover:border-primary-100" onClick={() => handleClickChat(item._id)}>
            {/* 썸네일 이미지 */}
            <div className="flex-shrink-0 w-[72px] h-[72px] m-3 rounded-xl overflow-hidden">
              {item.img ? (
                <img src={`http://localhost:4000/${item.img}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-300">
                  <FiMessageCircle size={28} />
                </div>
              )}
            </div>

            {/* 콘텐츠 */}
            <div className="flex flex-col flex-1 min-w-0 py-3 pr-4">
              {/* 1행: 제목 + 시간 */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm font-nanum-bold text-gray-900 truncate">{item.title}</h3>
                  {isAdmin && <span className="flex-shrink-0 text-[10px] bg-primary-100 text-primary-700 font-nanum-bold px-1.5 py-0.5 rounded-full">내 모임</span>}
                </div>
                {timeLabel && <span className="flex-shrink-0 text-[11px] text-gray-400">{timeLabel}</span>}
              </div>

              {/* 2행: 최근 메시지 미리보기 */}
              <p className={`text-xs truncate mb-1.5 ${item.latestMessage ? "text-gray-500" : "text-gray-300 italic"}`}>{preview}</p>

              {/* 3행: 멤버 아바타 + 인원 */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {item.memberInfo?.slice(0, 4).map((m, i) => (
                    <img key={i} src={m.profilePic || "https://via.placeholder.com/32"} alt="" className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <FiUsers className="w-3 h-3" />
                  <span>
                    {item.members?.length}/{item.maxMember}명
                  </span>
                </div>
              </div>
            </div>

            {/* 우측 채팅 진입 힌트 (hover) */}
            <div className="flex-shrink-0 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 text-xs text-primary-500">
                <FiMessageCircle size={14} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClubCard3;
