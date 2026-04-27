import MyUpdate  from "./sections/MyUpdate/MyUpdate";
import MyChat    from "./sections/MyChat/MyChat.jsx";
import MyClub    from "./sections/MyClub/MyClub.jsx";
import MySetting from "./sections/MySetting";
import MyMessage from "./sections/MyMessage/MyMessage.jsx";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiEdit2, FiX, FiCamera, FiTrash2, FiEdit, FiUser } from "react-icons/fi";
import { myPage } from "../../store/actions/userActions";
import axiosInstance from "../../utils/axios";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

const MyPage = () => {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const navigate  = useNavigate();
  const user = useSelector((state) => state.user?.userData?.user || {});
  const myMessage = useSelector((state) => state.myMessage?.messages || []);

  const [open,         setOpen]         = useState(false);
  const [imageSrc,     setImageSrc]     = useState("");
  const [showPopover,  setShowPopover]  = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [openModal,    setOpenModal]    = useState(false);
  const [newIntroduction, setNewIntroduction] = useState(user?.profilePic?.introduction || "");
  const [introError,   setIntroError]   = useState("");
  const [showAll,      setShowAll]      = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  const routes = [
    { path: "",          name: "모임 관리",  component: <MyClub /> },
    { path: "chat",      name: "채팅",       component: <MyChat /> },
    { path: "myupdate",  name: "회원 정보",  component: <MyUpdate /> },
    { path: "mymessage", name: "메시지 함",  component: <MyMessage /> },
    { path: "setting",   name: "안내사항",   component: <MySetting /> },
  ];

  useEffect(() => {
    setUnreadCount(myMessage.filter((m) => !m.isRead).length);
  }, [myMessage]);

  useEffect(() => {
    const path = location.pathname.split("/").slice(-1)[0];
    const valid = routes.find((r) => r.path === path);
    setSelectedSection(valid ? path : "");
  }, [location.pathname]);

  useEffect(() => { dispatch(myPage()); }, [dispatch]);

  const handleSectionClick = (to) => { setSelectedSection(to); navigate(to); };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) setImageSrc(URL.createObjectURL(file));
  };

  const handleEditClick = async () => {
    document.getElementById("profileUpload").click();
    setShowPopover(false);
    const fileInput = document.getElementById("profileUpload");
    fileInput.addEventListener("change", async () => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        try {
          await axiosInstance.put("/users/profile/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          dispatch(myPage());
          alert("이미지가 성공적으로 수정되었습니다.");
        } catch (error) {
          alert(`이미지 수정에 실패했습니다.`);
        }
      }
    }, { once: true });
  };

  const handleDeleteClick = async () => {
    setShowPopover(false);
    try {
      const response = await axiosInstance.delete("/users/profile/image_del");
      if (response.status === 200) {
        await dispatch(myPage());
        alert("이미지가 성공적으로 삭제되었습니다.");
      } else {
        alert("이미지 삭제에 실패했습니다.");
      }
    } catch {
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  const handleSaveIntroduction = async () => {
    try {
      const response = await axiosInstance.put("/users/introduction", { introduction: newIntroduction });
      if (response.status === 200) {
        alert("소개가 성공적으로 업데이트되었습니다.");
        await dispatch(myPage());
        setOpenModal(false);
      } else {
        alert("소개 업데이트에 실패했습니다.");
      }
    } catch {
      alert("소개 업데이트에 실패했습니다.");
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 30) setIntroError("소개글은 30자 이하로 작성해야 합니다.");
    else { setIntroError(""); setNewIntroduction(value); }
  };

  const visibleCount = 6;
  const categories   = user?.category || [];
  const flattenedSubCategories = categories.flatMap((cat) => cat.sub || []);
  const displayedSubCategories = showAll
    ? flattenedSubCategories
    : flattenedSubCategories.slice(0, visibleCount);
  const remainingCount = flattenedSubCategories.length - visibleCount;

  return (
    <div className="w-full min-h-screen" style={{ background: "#FAF8F5" }}>
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-0 min-h-screen">

        {/* ── 왼쪽 프로필 사이드바 ── */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="lg:sticky lg:top-[70px] bg-white border-b border-gray-100 lg:border-b-0 lg:border-r lg:min-h-screen p-6">

            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-6 pt-4">
              <div className="relative mb-3">
                <img
                  src={user?.profilePic?.thumbnailImage || ""}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 cursor-pointer shadow-sm"
                  onClick={() => { setImageSrc(user?.profilePic?.originalImage || ""); setOpen(true); }}
                />
                <button
                  onClick={() => setShowPopover(true)}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full shadow-md flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <FiCamera className="w-3.5 h-3.5 text-white" />
                </button>

                {/* 팝오버 */}
                {showPopover && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPopover(false)} />
                    <div className="absolute left-8 bottom-0 z-50 bg-white border border-gray-200 rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 min-w-[120px]">
                      <button onClick={handleEditClick}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                        <FiEdit className="w-3.5 h-3.5" /> 수정하기
                      </button>
                      <button onClick={handleDeleteClick}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-500 transition-colors">
                        <FiTrash2 className="w-3.5 h-3.5" /> 삭제하기
                      </button>
                    </div>
                  </>
                )}
                <input accept="image/*" type="file" className="hidden" id="profileUpload" onChange={handleImageChange} />
              </div>

              {/* 이름 + 기본 정보 */}
              <h3 className="font-nanum-bold text-gray-900 text-lg">{user?.name || "사용자"}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {user?.homeLocation ? user.homeLocation.city : "거주지 없음"}
                {user?.age?.year ? ` · ${user.age.year}년생` : ""}
              </p>

              {/* 소개글 */}
              <div className="flex items-center gap-1.5 mt-3 w-full justify-center">
                <p className="text-sm text-gray-600 text-center">
                  {user?.profilePic?.introduction || "소개글을 작성해보세요"}
                </p>
                <button
                  onClick={() => { setNewIntroduction(user?.profilePic?.introduction || ""); setOpenModal(true); }}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <FiEdit2 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* 카테고리 태그 */}
            {flattenedSubCategories.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 font-nanum-bold mb-2 uppercase tracking-wide">관심사</p>
                <div className="flex flex-wrap gap-1.5">
                  {displayedSubCategories.map((sub, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-nanum-bold rounded-full border border-primary-100">
                      {sub}
                    </span>
                  ))}
                  {!showAll && remainingCount > 0 && (
                    <button onClick={() => setShowAll(true)}
                      className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-nanum-bold rounded-full hover:bg-gray-200 transition-colors">
                      +{remainingCount}
                    </button>
                  )}
                  {showAll && remainingCount > 0 && (
                    <button onClick={() => setShowAll(false)}
                      className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-nanum-bold rounded-full hover:bg-gray-200 transition-colors">
                      접기
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 네비게이션 */}
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <div key={route.path} className="relative">
                  <button
                    onClick={() => handleSectionClick(route.path)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-nanum-bold transition-all duration-200
                      ${selectedSection === route.path
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {route.name}
                  </button>
                  {route.path === "mymessage" && unreadCount > 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* ── 오른쪽 콘텐츠 ── */}
        <div className="flex-1 p-4 md:p-6">
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.component} />
            ))}
          </Routes>
        </div>
      </div>

      {/* ── 소개글 수정 모달 ── */}
      {openModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[380px] relative mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-nanum-bold text-gray-900">소개글 수정</h3>
              <button onClick={() => setOpenModal(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <textarea
              className={`w-full border rounded-xl p-3 resize-none text-sm outline-none transition-colors
                ${introError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary-400"}`}
              rows={4}
              value={newIntroduction}
              onChange={handleChange}
              placeholder="30자 이내로 소개글을 작성해보세요"
            />
            {introError && <p className="text-red-500 text-xs mt-1">{introError}</p>}
            <p className="text-xs text-gray-400 text-right mt-1">{newIntroduction.length}/30</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveIntroduction}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-nanum-bold transition-colors">
                저장하기
              </button>
              <button onClick={() => setOpenModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-nanum-bold transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 이미지 미리보기 모달 ── */}
      {open && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img src={imageSrc} alt="Profile Preview" className="max-w-[480px] max-h-[480px] object-contain rounded-2xl" />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
            >
              <FiX className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
