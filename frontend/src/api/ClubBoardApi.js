import axiosInstance from "../utils/axios";

// 회원 여부 확인 API 호출
export const checkMembership = async (clubNumber, author) => {
  try {
    const response = await axiosInstance.get("http://localhost:4000/clubs/boards/membership", {
      params: { clubNumber, email: author },
    });
    return response.data.isMember;
  } catch (error) {
    console.error("회원 여부 확인 오류:", error);
    throw error;
  }
};

// 게시글 저장 API 호출
export const savePost = async (data) => {
  try {
    await axiosInstance.post("http://localhost:4000/clubs/boards/posts", data);
  } catch (error) {
    console.error("게시글 저장 오류:", error);
    throw error;
  }
};

// 투표 저장 API 호출
export const saveVote = async (data) => {
  try {
    await axiosInstance.post("http://localhost:4000/clubs/boards/votes", data);
  } catch (error) {
    console.error("투표 저장 오류:", error);
    throw error;
  }
};

// 게시물 목록을 가져오는 API 호출 (페이징 처리 전 )
// export const fetchPosts = async (clubNumber, page = 1) => {
//   try {
//     const response = await axiosInstance.get('http://localhost:4000/clubs/boards/all', {
//       params: { clubNumber, page, limit: 12 } // 페이지와 limit을 쿼리로 전달
//     });
//     return response.data;
//   } catch (error) {
//     console.error('게시물 목록 조회 오류:', error);
//     throw error;
//   }
// };

// 게시물 목록을 가져오는 API 호출 (페이징 처리 후 )
export const fetchPosts = async (clubNumber, page = 1, limit = 12, category = "") => {
  try {
    const response = await axiosInstance.get("http://localhost:4000/clubs/boards/all", {
      params: { clubNumber, page, limit, category },
    });

    const { boards, totalBoards, totalPages } = response.data;

    if (!boards || typeof totalBoards !== "number" || typeof totalPages !== "number") {
      throw new Error("Invalid response data");
    }

    return { boards, totalBoards, totalPages };
  } catch (error) {
    console.error("게시물 목록 조회 오류:", error);
    throw error;
  }
};

// 게시물 조회
export const fetchPost = async (postId) => {
  try {
    const response = await axiosInstance.get(`http://localhost:4000/clubs/boards/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("게시물 조회 오류:", error);
    throw error;
  }
};

// 게시물 삭제
export const deletePost = async (postId) => {
  try {
    await axiosInstance.delete(`http://localhost:4000/clubs/boards/posts/${postId}`);
  } catch (error) {
    console.error("게시물 삭제 오류:", error);
    throw error;
  }
};

// 게시물 업데이트
export const updatePost = async (postId, postData) => {
  try {
    await axiosInstance.put(`http://localhost:4000/clubs/boards/posts/${postId}`, postData);
  } catch (error) {
    console.error("게시물 업데이트 오류:", error);
    throw error;
  }
};

// 투표 정보 가져오기
export const fetchVote = async (voteId) => {
  try {
    const response = await axiosInstance.get(`/clubs/boards/votes/${voteId}`);
    return response.data;
  } catch (error) {
    console.error("투표 정보를 가져오는 중 오류 발생:", error);
    throw error;
  }
};

// 투표 요약 정보 가져오기
export const fetchVoteSummary = async (voteId) => {
  try {
    const response = await axiosInstance.get(`/clubs/boards/votes/${voteId}/summary`);
    return response.data;
  } catch (error) {
    console.error("투표 요약 정보를 가져오는 중 오류 발생:", error);
    throw error;
  }
};

// 투표하기
export const voteForOption = async (voteId, option, email) => {
  try {
    await axiosInstance.post(`/clubs/boards/votes/${voteId}/vote`, { option, email });
  } catch (error) {
    console.error("투표하기 중 오류 발생:", error);
    throw error;
  }
};

// 투표 취소하기
export const removeVote = async (voteId, option, email) => {
  try {
    await axiosInstance.put(`/clubs/boards/votes/${voteId}`, { option, email });
  } catch (error) {
    console.error("투표 취소 중 오류 발생:", error);
    throw error;
  }
};

// 투표 삭제하기
export const deleteVote = async (voteId) => {
  try {
    await axiosInstance.delete(`/clubs/boards/votes/${voteId}`);
  } catch (error) {
    console.error("투표 삭제 중 오류 발생:", error);
    throw error;
  }
};
