// src/hooks/usePost.js
//게시글 등록

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Fetch a single post by ID
const fetchPost = async (postId) => {
  const response = await axios.get(`http://localhost:4000/clubs/boards/posts/${postId}`);
  return response.data;
};

// Custom hook to fetch a post
export const usePost = (postId) => {
  return useQuery({
    queryKey: ["post", postId], // Query key setup
    queryFn: () => fetchPost(postId), // Query function
    enabled: !!postId, // Only fetch if postId exists
  });
};

// Fetch all votes
// const fetchVotes = async () => {
//   const { data } = await axios.get('http://localhost:4000/api/votes');
//   return data;
// };

// // Custom hook to fetch all votes
// export const useVotes = () => {
//   return useQuery({
//     queryKey: ['votes'],
//     queryFn: fetchVotes
//   });
// };

// // Fetch a specific vote by ID
// const fetchVoteById = async (voteId) => {
//   const { data } = await axios.get(`http://localhost:4000/api/votes/${voteId}`);
//   return data;
// };

// // Custom hook to fetch a specific vote
// export const useVote = (voteId) => {
//   return useQuery({
//     queryKey: ['vote', voteId],
//     queryFn: () => fetchVoteById(voteId),
//     enabled: !!voteId // Only fetch if voteId exists
//   });
// };

// // Delete a vote
// const deleteVote = async (voteId) => {
//   await axios.delete(`http://localhost:4000/api/votes/${voteId}`);
// };

// // Custom hook to delete a vote and invalidate the votes query
// export const useDeleteVote = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteVote,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['votes']); // Invalidate the votes query to refetch data
//     }
//   });
// };
