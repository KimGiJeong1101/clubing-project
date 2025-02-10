import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Box, TextField, List, ListItem, ListItemText, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, styled } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ChatIcon from "@mui/icons-material/Chat";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: "4px",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  boxSizing: "border-box",
}));

const ReadVote = ({ voteId, onDelete }) => {
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
        const response = await axios.get(`http://localhost:4000/clubs/boards/votes/${voteId}`);
        setVote(response.data);

        // Determine if the vote has ended
        const currentTime = new Date();
        const endTime = new Date(response.data.endTime);
        setIsVoteEnded(currentTime > endTime);

        const summaryResponse = await axios.get(`http://localhost:4000/clubs/boards/votes/${voteId}/summary`);
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
  }, [voteId, email]);

  const { mutate: deleteVote } = useMutation({
    mutationFn: async () => {
      await axios.delete(`http://localhost:4000/clubs/boards/votes/${voteId}`);
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
        await axios.post(`http://localhost:4000/clubs/boards/votes/${voteId}/vote`, { option: selectedOption, email });
        setHasVoted(true);
        setVotedOptions([...votedOptions, selectedOption]);

        const updatedSummary = summary.map((item) => (item.option === selectedOption ? { ...item, count: item.count + 1 } : item));
        setSummary(updatedSummary);

        // Open summary after voting
        setIsVoteEnded(true);
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
      const response = await axios.get(`http://localhost:4000/clubs/boards/votes/${voteId}/summary`);
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
        await axios.put(`http://localhost:4000/clubs/boards/votes/${voteId}`, {
          option: selectedOption,
          email,
        });

        setHasVoted(false);
        setSelectedOption(null);
        setVotedOptions(votedOptions.filter((option) => option !== selectedOption));

        const updatedSummaryResponse = await axios.get(`http://localhost:4000/clubs/boards/votes/${voteId}/summary`);
        setSummary(updatedSummaryResponse.data);
      } catch (error) {
        console.error("투표 취소 중 오류 발생:", error);
      }
    }
  };

  const handleDelete = () => {
    deleteVote();
  };

  console.log("vote:", vote);

  return (
    <Container>
      {/* <Typography variant="h4" component="h1" gutterBottom>
        투표 내용
      </Typography> */}
      {vote && (
        <>
          <Box sx={{ padding: 2 }}>
            <TextField label="투표 제목" variant="outlined" fullWidth margin="normal" value={vote.title} readOnly />
            {!hasVoted && !isVoteEnded && (
              <List>
                {vote.options.map((option, index) => {
                  const count = summary.find((item) => item.option === option)?.count || 0;
                  return (
                    <StyledListItem key={index} onClick={() => handleOptionClick(option)}>
                      <ListItemText primary={option} />
                      {/* <ListItemText secondary={`선택 수: ${count}`} /> */}
                    </StyledListItem>
                  );
                })}
              </List>
            )}
            <Box my={2}>
              {!isVoteEnded ? (
                <>
                  {!hasVoted ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVote}
                      disabled={!selectedOption}
                      mr={2}
                      sx={{
                        backgroundColor: "#DBC7B5",
                        color: "#000",
                        "&:hover": {
                          backgroundColor: "#A67153",
                        },
                      }}
                    >
                      투표하기
                    </Button>
                  ) : (
                    <Button variant="contained" color="primary" onClick={handleRemoveVote} mr={2}>
                      투표 취소하기
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSummaryOpen}
                  mr={2}
                  sx={{
                    backgroundColor: "#DBC7B5",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#A67153",
                    },
                  }}
                >
                  투표 결과 보기
                </Button>
              )}
              {isAuthor && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  mr={2}
                  sx={{
                    backgroundColor: "#6E3C21",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#A67153",
                    },
                  }}
                >
                  투표 삭제
                </Button>
              )}
            </Box>
            <TextField label="투표 종료 시간" type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth margin="normal" value={formatToLocalDatetime(vote.endTime)} readOnly />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end", // 아이콘을 오른쪽 끝으로 정렬
              width: "100%", // 전체 너비를 사용하여 아이콘이 오른쪽 끝에 위치하도록 함
            }}
          >
            <ChatIcon
              sx={{
                color: "#999999",
                fontSize: "30px",
                marginRight: "15px",
              }}
            />
          </Box>
        </>
      )}
      <Dialog open={openSummary} onClose={handleSummaryClose} fullWidth maxWidth="md">
        <DialogTitle>투표 결과</DialogTitle>
        <DialogContent>
          <List>
            {summary.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item.option} />
                <ListItemText secondary={`선택 수: ${item.count}`} />
                {/* `anonymous`가 true일 때 `투표한 사람` 부분 숨기기 */}
                {!vote.anonymous && <ListItemText secondary={`투표한 사람: ${item.emails}`} />}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSummaryClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReadVote;
