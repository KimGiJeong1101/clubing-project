import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMapPin, FiUsers, FiPlus, FiShare2, FiMenu,
  FiClock, FiDollarSign, FiCheckCircle, FiCircle,
  FiTrash2, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "./../../../utils/axios";
import { fetchCategoryClubList } from "../../../store/reducers/clubReducer.js";
import MeetingCreate1 from "../meeting/MeetingCreate1.jsx";
import MeetingCreate2 from "../meeting/MeetingCreate2.jsx";
import ClubCarousel from "../../../components/club/ClubCarousel.jsx";
import MemberModal from "./MemberModal.jsx";
import WishHearts from "../../../components/club/WishHearts.jsx";
import { sendMessage } from "../../../store/actions/myMessageActions";
import { saveVisitClub } from "../../../store/actions/RecentVisitAction";

/* ── 섹션 헤더 ── */
const SectionLabel = ({ sub, title }) => (
  <div className="mt-8 mb-4">
    <p className="text-xs font-nanum-bold text-primary-500 uppercase tracking-widest mb-1">{sub}</p>
    <p className="text-lg font-nanum-bold text-gray-900">{title}</p>
  </div>
);

const Main = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams(location.search);
  const clubNumber  = queryParams.get("clubNumber");

  /* ── 스낵바 ── */
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });
  const showSnack = (msg) => {
    setSnackbar({ open: true, msg });
    setTimeout(() => setSnackbar({ open: false, msg: "" }), 3000);
  };

  useEffect(() => {
    if (location.state?.snackbarMessage) showSnack(location.state.snackbarMessage);
  }, [location]);

  /* ── Redux state ── */
  const getClub  = useSelector((state) => state.getClub);
  const user     = useSelector((state) => state.user);
  const email    = user.userData.user.email;

  /* ── UI state ── */
  const [isExpanded,      setIsExpanded]      = useState(false);
  const [popoverOpen,     setPopoverOpen]     = useState(false);
  const [memberModalOpen,  setMemberModalOpen]  = useState(false);
  const [memberModalOpen2, setMemberModalOpen2] = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [open,            setOpen]            = useState(false);
  const [secondModal,     setSecondModal]     = useState(false);
  const [category,        setCategory]        = useState("");

  /* ── 정모 state ── */
  const [meetingList,        setMeetingList]        = useState([]);
  const [meetingBooleans,    setMeetingBooleans]    = useState([]);

  /* ── 비슷한 클럽 ── */
  const getCategoryClubList = useSelector((state) => state.categoryClub);
  const [clubList, setClubList] = useState([]);
  useEffect(() => {
    setClubList(
      getCategoryClubList.clubs.filter((c) => c._id.toString() !== clubNumber)
    );
  }, [getCategoryClubList]);

  /* ── 클럽 데이터 ── */
  const getReadClub = async () => {
    const response = await fetch(`http://localhost:4000/clubs/read2/${clubNumber}`);
    const data = await response.json();
    await dispatch(fetchCategoryClubList(data.mainCategory));
    return data;
  };

  const { data: readClub, isLoading, isError, error } = useQuery({
    queryKey: ["readClub", clubNumber, memberModalOpen, memberModalOpen2, secondModal],
    queryFn:  getReadClub,
    enabled:  !!clubNumber,
  });

  const adminEmail = readClub?.admin || getClub.clubs?.admin || "";
  const isAdmin    = email === adminEmail;
  const isManager  = readClub?.manager?.includes(email);
  const isMember   = readClub?.members?.includes(email);

  /* ── 정모 목록 fetch ── */
  const refreshMeetings = async () => {
    const res  = await axiosInstance.get(`http://localhost:4000/meetings/${clubNumber}`);
    const booleans = res.data.map((m) => m.joinMember.includes(email));
    setMeetingList(res.data);
    setMeetingBooleans(booleans);
  };

  useEffect(() => {
    if (clubNumber) refreshMeetings();
  }, [clubNumber, email]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [clubNumber]);

  /* ── 최근 방문 저장 ── */
  useEffect(() => {
    if (clubNumber && email) {
      dispatch(saveVisitClub({ clubs: clubNumber, email })).catch(console.error);
    }
  }, [clubNumber, email, dispatch]);

  /* ── 핸들러 ── */
  const FadHandleClick = (picCategory) => {
    setCategory(picCategory);
    setOpen(false);
    setSecondModal(true);
  };

  const cancellClub = () => {
    if (!email) { showSnack("로그인 정보가 없습니다."); return; }
    axiosInstance.post(`http://localhost:4000/clubs/cencellMember/${clubNumber}`)
      .then(() => {
        const msgs = [
          { club: clubNumber, recipient: email, sender: getClub.clubs.title, content: `${getClub.clubs.title}에서 탈퇴하셨습니다.`, title: "모임 탈퇴 성공" },
          { club: clubNumber, recipient: getClub.clubs.admin, sender: email, content: `${email}님이 모임에서 탈퇴하셨습니다.`, title: "탈퇴" },
        ];
        dispatch(sendMessage(msgs[0]));
        axiosInstance.post("/users/messages", msgs[1]).catch(console.error);
        navigate("/clubList", { state: { snackbarMessage: "모임 탈퇴가 완료되었습니다." } });
      })
      .catch(() => showSnack("모임 탈퇴에 실패했습니다."));
  };

  const deleteMeeting = async (meetingId) => {
    await fetch(`http://localhost:4000/meetings/delete/${meetingId}`);
    showSnack("정기모임이 삭제되었습니다.");
    refreshMeetings();
  };

  const meetingJoin = (meetingId) => {
    if (!email) { showSnack("로그인 정보가 없습니다."); return; }
    axiosInstance.post(`/meetings/join/${meetingId}`)
      .then((res) => {
        showSnack(res.data.message === "참석 취소" ? "참석이 취소되었습니다." : "참석이 성공했습니다.");
        refreshMeetings();
      })
      .catch(() => showSnack("참석에 실패했습니다."));
  };

  const handleUpdate  = () => navigate(`/clubs/main/update?clubNumber=${clubNumber}`);
  const handleDelete2 = async () => {
    try {
      await axiosInstance.delete(`http://localhost:4000/clubs/delete/${clubNumber}`);
      navigate("/clubList", { state: { snackbarMessage: "모임 삭제가 완료되었습니다." } });
    } catch { console.error("삭제 실패"); }
  };

  const handleInvite = async (inviteEmail) => {
    try {
      const response = await axiosInstance.post(`/clubs/invite/${clubNumber}`, { email: inviteEmail });
      if (response.status === 200) {
        alert("초대를 했습니다.");
        const message = {
          club: clubNumber, recipient: inviteEmail, sender: getClub.clubs.title,
          content: `${getClub.clubs.title}에서 모임에 초대합니다.`, title: "모임 초대",
        };
        dispatch(sendMessage(message));
        queryClient.invalidateQueries(["readClub", clubNumber, memberModalOpen, memberModalOpen2]);
      }
    } catch { alert("초대 중 오류가 발생했습니다."); }
  };

  /* ── 로딩/에러 ── */
  if (isLoading) return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>
      <div className="max-w-2xl mx-auto pt-4 animate-pulse space-y-4 px-4">
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
  if (isError) return <div className="flex items-center justify-center h-64 text-red-500">오류: {error.message}</div>;

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* ── 정모 생성 모달 ── */}
      {open && <MeetingCreate1 open={open} handleCloseModal={() => setOpen(false)} FadHandleClick={FadHandleClick} />}
      {secondModal && (
        <MeetingCreate2
          clubNumber={clubNumber}
          secondModalClose={() => setSecondModal(false)}
          secondModal={secondModal}
          category={category}
          setSnackbarMessageMain={(m) => setSnackbar({ open: true, msg: m })}
          handleSnackbarClickMain={() => {}}
        />
      )}

      <div className="max-w-2xl mx-auto pb-20">

        {/* ── 대표 이미지 ── */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={`http://localhost:4000/${readClub?.img}`}
            alt="클럽 대표 이미지"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="bg-white px-5 pt-5 pb-6">

          {/* ── 클럽 기본 정보 ── */}
          <div className="flex items-start gap-3">
            <img
              src={readClub.clubmembers[0]?.thumbnailImage || ""}
              alt="host"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-nanum-bold text-gray-900 leading-tight mb-1">{readClub.title}</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  호스트 <span className="font-nanum-bold text-gray-700">{readClub.adminNickName}</span>
                </p>
                {/* 우측 액션 버튼들 */}
                <div className="flex items-center gap-0.5">
                  <WishHearts />
                  <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="공유">
                    <FiShare2 className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setPopoverOpen((o) => !o)}
                      className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="더보기"
                    >
                      <FiMenu className="w-4 h-4" />
                    </button>
                    {popoverOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setPopoverOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[150px] overflow-hidden">
                          {email !== adminEmail && isMember && (
                            <button onClick={cancellClub} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                              클럽 탈퇴하기
                            </button>
                          )}
                          <button onClick={() => setPopoverOpen(false)} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            모임 url 공유하기
                          </button>
                          <button onClick={() => setPopoverOpen(false)} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            모임 신고하기
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 통계 chips ── */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-nanum-bold px-3 py-1 rounded-full">
              <FiUsers className="w-3 h-3" /> {readClub.members?.length}/{readClub.maxMember}명
            </span>
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-nanum-bold px-3 py-1 rounded-full">
              <FiClock className="w-3 h-3" /> {readClub.meeting.length}개 정기모임
            </span>
            {readClub.region?.neighborhood && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-nanum-bold px-3 py-1 rounded-full">
                <FiMapPin className="w-3 h-3" /> {readClub.region.neighborhood}
              </span>
            )}
          </div>

          <hr className="my-5 border-gray-100" />

          {/* ── 소개 ── */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{readClub.content}</p>
        </div>

        {/* ── 정기 모임 섹션 ── */}
        <div className="bg-white mt-3 px-5 pt-2 pb-6">
          <SectionLabel sub="정기 모임" title="정기적으로 모임을 가지고 있어요" />

          {readClub.meeting.length === 0 ? (
            isAdmin ? (
              <div className="bg-primary-50 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
                <p className="font-nanum-bold text-gray-700">아직 정모가 없어요!</p>
                <p className="text-sm text-gray-500">정모를 만들어 멤버들을 불러보세요</p>
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl text-sm transition-colors"
                >
                  <FiPlus className="w-4 h-4" /> 정모 만들기
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4">아직 정기모임이 없습니다.</p>
            )
          ) : (
            <div className="space-y-4">
              {readClub.meeting.map((meeting, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <div className="flex gap-0">
                    {/* 이미지 */}
                    <div className="w-32 flex-shrink-0 overflow-hidden">
                      <img
                        src={`http://localhost:4000/${meeting?.img}`}
                        alt="meeting"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* 내용 */}
                    <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                      <h3 className="font-nanum-bold text-gray-900 truncate mb-1.5">{meeting.title}</h3>
                      <div className="space-y-0.5 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1.5">
                          <FiClock className="w-3 h-3 flex-shrink-0 text-primary-400" />
                          <span className="truncate">{meeting.dateTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiMapPin className="w-3 h-3 flex-shrink-0 text-primary-400" />
                          <span className="truncate">{meeting.where}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiDollarSign className="w-3 h-3 flex-shrink-0 text-primary-400" />
                          <span className="truncate">{meeting.cost}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {/* 아바타 + 인원 */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {meetingList[i]?.joinMemberInfo?.slice(0, 4).map((m, idx) => (
                              <img key={idx} src={m.thumbnailImage} alt="" className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {meetingList[i]?.joinMember?.length}/{meetingList[i]?.totalCount}
                          </span>
                        </div>
                        {/* 버튼 */}
                        <div className="flex gap-1.5">
                          {isAdmin && (
                            <button
                              onClick={() => deleteMeeting(meeting._id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white text-red-400 border border-red-200 rounded-lg text-xs font-nanum-bold hover:bg-red-50 transition-colors"
                            >
                              <FiTrash2 className="w-3 h-3" /> 삭제
                            </button>
                          )}
                          <button
                            onClick={() => meetingJoin(meeting._id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-nanum-bold transition-colors
                              ${meetingBooleans[i]
                                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                : "bg-primary-600 text-white hover:bg-primary-700"
                              }`}
                          >
                            {meetingBooleans[i]
                              ? <><FiCheckCircle className="w-3 h-3" /> 취소</>
                              : <><FiCircle className="w-3 h-3" /> 참석</>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 정모 추가 버튼 (admin) */}
              {isAdmin && (
                <button
                  onClick={() => setOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-50 hover:bg-primary-100 text-primary-600 font-nanum-bold rounded-xl text-sm border border-primary-100 transition-colors"
                >
                  <FiPlus className="w-4 h-4" /> 정모 추가하기
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 가입 멤버 ── */}
        <div className="bg-white mt-3 px-5 pt-2 pb-6">
          <div className="flex items-center justify-between mt-6 mb-4">
            <div>
              <p className="text-xs font-nanum-bold text-primary-500 uppercase tracking-widest mb-0.5">가입 멤버</p>
              <p className="text-lg font-nanum-bold text-gray-900">함께 소통하며 활동하고 있어요</p>
            </div>
            {(isAdmin || isManager) && (
              <button
                onClick={() => setMemberModalOpen(true)}
                className="text-xs font-nanum-bold text-primary-600 hover:text-primary-800 transition-colors"
              >
                멤버 관리 →
              </button>
            )}
          </div>

          <div className={`relative overflow-hidden transition-all duration-300 ${isExpanded ? "h-auto" : "h-[200px]"}`}>
            <div className="space-y-2">
              {readClub.clubmembers?.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <img
                    src={member?.thumbnailImage || ""}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-nanum-bold text-gray-800 truncate">{member.name}</p>
                    {idx === 0 && <span className="text-[10px] text-primary-500 font-nanum-bold">호스트</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* 페이드 그라데이션 */}
            {!isExpanded && readClub.clubmembers?.length > 3 && (
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>

          {readClub.clubmembers?.length > 3 && (
            <button
              onClick={() => setIsExpanded((p) => !p)}
              className="mt-2 w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? <><FiChevronUp className="w-4 h-4" /> 접기</> : <><FiChevronDown className="w-4 h-4" /> 전체 보기 ({readClub.members?.length}명)</>}
            </button>
          )}
        </div>

        {/* ── 찜한 사람들 (관리자만) ── */}
        {isAdmin && readClub.wishmembers?.length > 0 && (
          <div className="bg-white mt-3 px-5 pt-2 pb-6">
            <div className="flex items-center justify-between mt-6 mb-4">
              <div>
                <p className="text-xs font-nanum-bold text-primary-500 uppercase tracking-widest mb-0.5">찜하기 목록</p>
                <p className="text-lg font-nanum-bold text-gray-900">찜하기 한 사람들 ({readClub.wishHeart?.length})</p>
              </div>
              <button
                onClick={() => setMemberModalOpen2(true)}
                className="text-xs font-nanum-bold text-primary-600 hover:text-primary-800 transition-colors"
              >
                멤버 관리 →
              </button>
            </div>
            <div className="space-y-2">
              {readClub.wishmembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <img
                    src={member?.thumbnailImage || ""}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
                  />
                  <p className="flex-1 text-sm font-nanum-bold text-gray-800 truncate">{member.name}</p>
                  {!readClub.members?.includes(member.email) && !member.invite?.includes(readClub._id) && (
                    <button
                      onClick={() => handleInvite(member.email)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-nanum-bold rounded-lg transition-colors flex-shrink-0"
                    >
                      초대하기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 안내 사항 ── */}
        <div className="bg-white mt-3 px-5 pt-2 pb-6">
          <SectionLabel sub="안내 사항" title="자세한 정보를 알려드릴게요" />
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span>최대 {readClub.maxMember}명</span>
            </div>
            {readClub.region?.neighborhood && (
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>{readClub.region.neighborhood}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 비슷한 클럽 ── */}
        <div className="bg-white mt-3 px-5 pt-2 pb-6">
          <SectionLabel sub="비슷한 클럽" title="이런 클럽은 어때요?" />
          {clubList.length > 1 ? (
            <ClubCarousel clubList={clubList} />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-2xl mb-2">🔍</span>
              <p className="text-sm text-gray-400">같은 카테고리 관련 클럽이 적습니다</p>
            </div>
          )}
        </div>

      </div>

      {/* ── 관리자 FAB ── */}
      {isAdmin && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="fixed bottom-10 right-10 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all duration-200"
            aria-label="관리"
          >
            <FiPlus className="w-6 h-6" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="fixed bottom-28 right-10 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 min-w-[160px] overflow-hidden">
                <button onClick={() => { handleUpdate(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  모임 및 게시글 수정
                </button>
                <button onClick={() => { handleDelete2(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  모임 삭제
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 멤버 모달 ── */}
      {memberModalOpen && (
        <MemberModal
          clubNumber={clubNumber}
          members={readClub.clubmembers}
          open={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
        />
      )}
      {memberModalOpen2 && (
        <MemberModal
          clubNumber={clubNumber}
          members={readClub.wishmembers}
          open={memberModalOpen2}
          onClose={() => setMemberModalOpen2(false)}
        />
      )}

      {/* ── 스낵바 ── */}
      {snackbar.open && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="bg-white text-primary-700 font-nanum-bold px-6 py-3 rounded-2xl shadow-xl border border-primary-100 text-sm">
            {snackbar.msg}
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
