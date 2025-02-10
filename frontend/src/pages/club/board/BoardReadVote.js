import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVote, fetchVoteSummary, voteForOption, removeVote, deleteVote } from '../../../api/ClubBoardApi';
import Reply from './Reply'; // 댓글 컴포넌트 추가

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '4px',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  boxSizing: 'border-box',
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
  const [openReply, setOpenReply] = useState(false); // 댓글 컴포넌트 열기 상태
  const queryClient = useQueryClient();

  const email = useSelector(state => state.user?.userData?.user?.email || null);

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

        const userHasVoted = voteData.votes.some(vote => vote.emails.includes(email));
        setHasVoted(userHasVoted);

        const votedOptionsList = voteData.votes
          .filter(vote => vote.emails.includes(email))
          .map(vote => vote.option);
        setVotedOptions(votedOptionsList);

        setIsAuthor(voteData.author === email);
      } catch (error) {
        console.error('투표 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchVoteData();
  }, [voteId, email]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteVote(voteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      if (onDelete) onDelete();
    },
    onError: (error) => {
      console.error('투표 삭제 중 오류 발생:', error);
    }
  });

  const voteMutation = useMutation({
    mutationFn: () => voteForOption(voteId, selectedOption, email),
    onSuccess: () => {
      setHasVoted(true);
      setVotedOptions([...votedOptions, selectedOption]);

      const updatedSummary = summary.map(item =>
        item.option === selectedOption ? { ...item, count: item.count + 1 } : item
      );
      setSummary(updatedSummary);

      setIsVoteEnded(true);
    },
    onError: (error) => {
      console.error('투표하기 중 오류 발생:', error);
    }
  });

  const removeVoteMutation = useMutation({
    mutationFn: () => removeVote(voteId, selectedOption, email),
    onSuccess: async () => {
      setHasVoted(false);
      setSelectedOption(null);
      setVotedOptions(votedOptions.filter(option => option !== selectedOption));

      const updatedSummary = await fetchVoteSummary(voteId);
      setSummary(updatedSummary);
    },
    onError: (error) => {
      console.error('투표 취소 중 오류 발생:', error);
    }
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
      console.error('투표 요약 정보를 가져오는 중 오류 발생:', error);
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
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleToggleReply = () => setOpenReply(prev => !prev); // 댓글 컴포넌트 열기/닫기

  return (
    <Container>
      {vote && (
        <>
          <Box sx={{ padding: 2 }}>
            <TextField
              label="투표 제목"
              variant="outlined"
              fullWidth
              margin="normal"
              value={vote.title}
              readOnly
            />
            {!hasVoted && !isVoteEnded && (
              <List>
                {vote.options.map((option, index) => {
                  const count = summary.find(item => item.option === option)?.count || 0;
                  return (
                    <StyledListItem
                      key={index}
                      onClick={() => handleOptionClick(option)}
                    >
                      <ListItemText primary={option} />
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
                        backgroundColor: '#DBC7B5',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#A67153'
                        }
                      }}
                    >
                      투표하기
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSummaryOpen}
                      mr={2}
                      sx={{
                        backgroundColor: '#DBC7B5',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#A67153'
                        }
                      }}
                    >
                      투표 결과 보기
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
                    backgroundColor: '#DBC7B5',
                    color: '#000',
                    '&:hover': {
                      backgroundColor: '#A67153'
                    }
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
                    backgroundColor: '#6E3C21',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#A67153'
                    }
                  }}
                >
                  투표 삭제
                </Button>
              )}
            </Box>

            <TextField
              label="투표 종료 시간"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              value={formatToLocalDatetime(vote.endTime)}
              readOnly
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%'
            }}
          >
            <ChatIcon
              sx={{
                color: '#999999',
                fontSize: '30px',
                marginRight: '15px',
                cursor: 'pointer'
              }}
              onClick={handleToggleReply} // 댓글 컴포넌트 열기/닫기
            />
          </Box>

          {/* 댓글 컴포넌트를 ReadVote 위치에 렌더링 */}
          {openReply && (
            <Box sx={{ padding: 2 }}>
              <Reply postType="Board" postId={voteId} />
            </Box>
          )}

          <Dialog open={openSummary} onClose={handleSummaryClose} fullWidth maxWidth="lg">
            <DialogTitle>투표 결과</DialogTitle>
            <DialogContent>
              <List>
                {summary.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item.option} />
                    <ListItemText secondary={`선택 수: ${item.count}`} />
                    {!vote.anonymous && (
                      <ListItemText secondary={`투표한 사람: ${item.emails}`} />
                    )}
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
        </>
      )}
    </Container>
  );
};

export default ReadVote;
