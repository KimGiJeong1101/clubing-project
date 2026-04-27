import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import CKEditor5Editor from "../../../components/club/ClubBoardRead"; // CKEditor 컴포넌트 가져오기
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import UpdatePost from "../../../components/club/ClubBoardUpdateEditor";
import { fetchPost, deletePost, updatePost } from "../../../api/ClubBoardApi";
import Reply from "./Reply"; // 댓글 컴포넌트 추가

const BoardRead = ({ postId, onClose }) => {
  const { id } = useParams(); // URL 파라미터에서 게시물 ID 가져오기
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  // 게시물 데이터 가져오기
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    onSuccess: (data) => {
      console.log("게시물 가져오기 성공:", data);
    },
    onError: (error) => {
      console.error("게시물 가져오기 오류:", error);
    },
  });

  const queryClient = useQueryClient();
  const author = useSelector((state) => state.user?.userData?.user?.email || null);

  // 상태 훅 정의
  const [openEditModal, setOpenEditModal] = useState(false); // 수정 모달 열기 상태
  const [openReply, setOpenReply] = useState(false); // 댓글 컴포넌트 표시 여부 상태
  const [title, setTitle] = useState(""); // 제목 상태
  const [category, setCategory] = useState(""); // 카테고리 상태
  const [content, setContent] = useState(""); // 내용 상태
  const [image, setImage] = useState(""); // 이미지 상태
  const [isAuthor, setIsAuthor] = useState(false); // 작성자 여부 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지 상태
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // 스낵바 심각도 상태

  // 게시물 업데이트 및 작성자 확인 처리
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || "");
      setIsAuthor(post.author === author);
    } else {
      setTitle("");
      setCategory("");
      setContent("");
      setImage("");
      setIsAuthor(false);
    }
  }, [post, author]);

  // 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]); // 게시물 목록 갱신
      onClose(); // 닫기 함수 호출
    },
    onError: (error) => {
      console.error("게시물 삭제 오류:", error);
    },
  });

  // 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: () => updatePost(postId, { title, category, content, image }),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]); // 게시물 목록 갱신
      setOpenEditModal(false); // 수정 모달 닫기
      onClose(); // 닫기 함수 호출
    },
    onError: (error) => {
      console.error("게시물 업데이트 오류:", error);
    },
  });

  // 핸들러 함수
  const handleDelete = () => deleteMutation.mutate(); // 삭제 처리
  const handleSave = () => {
    if (!title) {
      showSnackbar("제목이 없습니다.", "error");
      return;
    }
    if (!content) {
      showSnackbar("내용이 없습니다.", "error");
      return;
    }
    updateMutation.mutate(); // 저장 처리
  };

  const handleOpenEditModal = () => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImage(post.image || "");
    }
    setOpenEditModal(true); // 수정 모달 열기
  };

  const handleCloseEditModal = () => setOpenEditModal(false); // 수정 모달 닫기

  const handleToggleReply = () => setOpenReply((prev) => !prev); // 댓글 컴포넌트 열기/닫기

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true); // 스낵바 열기
  };

  const handleSnackbarClose = () => setSnackbarOpen(false); // 스낵바 닫기

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  if (error) return <p className="text-center py-8 text-red-500">게시물 가져오기 오류: {error.message}</p>;
  if (!post) return <p className="text-center py-8 text-gray-400">게시물을 찾을 수 없습니다.</p>;

  const postType = "Board"; // 포스트 타입

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 게시물 헤더 */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="flex gap-4 items-center mt-1 mb-4">
          <span className="text-sm text-gray-500">{post.category}</span>
          <span className="text-sm">작성자</span>
          <span className="text-sm">작성 시간</span>
        </div>
        <hr className="border-gray-200" />
      </div>

      {/* 게시물 본문 */}
      <div className="flex justify-center mb-4">
        <div className="max-w-[1000px] w-full">
          <CKEditor5Editor content={post.content} readOnly={true} />

          {/* 수정/삭제 버튼 (오른쪽 정렬) */}
          <div className="mt-4 flex justify-end w-full">
            <div className="flex gap-2">
              <button onClick={handleOpenEditModal} className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors">
                수정
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 컴포넌트 */}
      <div className="p-4">
        <Reply postType={postType} postId={id} />
      </div>

      {/* 수정 모달 */}
      {openEditModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4" onClick={handleCloseEditModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">게시물 수정</h2>
            </div>
            <div className="p-6">
              <UpdatePost post={{ title, category, content, image }} onChange={(data) => setContent(data)} title={title} setTitle={setTitle} category={category} setCategory={setCategory} content={content} setImage={setImage} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={handleCloseEditModal} className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                닫기
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors">
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스낵바 */}
      {snackbarOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400]">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${snackbarSeverity === "error" ? "bg-red-500" : "bg-green-500"}`}>
            <span>{snackbarMessage}</span>
            <button onClick={handleSnackbarClose} className="ml-2 hover:opacity-80">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardRead;
