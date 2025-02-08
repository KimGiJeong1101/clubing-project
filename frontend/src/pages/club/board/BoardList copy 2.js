//api 분리 전 백업
import React, { useState } from "react";
import { Container, List, ListItem, ListItemText, Box, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Read from "./BoardRead";
import ReadVote from "./BoardReadVote";
import { useLocation } from "react-router-dom";

const categoryStyles = {
  display: "inline",
  bgcolor: "#fff",
  color: "grey.800",
  border: "1px solid",
  borderColor: "grey.300",
  borderRadius: 2,
};

// API에서 게시물을 가져오는 함수
const fetchPosts = async (clubNumber) => {
  const response = await axios.get(`http://localhost:4000/clubs/boards/all?clubNumber=${clubNumber}`);
  return response.data;
};

const ListPosts = () => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemCategory, setSelectedItemCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 카테고리 상태 추가
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clubNumber = queryParams.get("clubNumber");

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", clubNumber],
    queryFn: () => fetchPosts(clubNumber),
    keepPreviousData: true,
  });

  const handleSelect = (id, category, title) => {
    setSelectedItemId(id);
    setSelectedItemCategory(category);
    setDialogTitle(title);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedItemId(null);
    setSelectedItemCategory("");
    setDialogTitle("");
  };

  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const clubNumber = queryParams.get("clubNumber");

  // const { data: items, isLoading, error } = useQuery({
  //   queryKey: ['posts', clubNumber],
  //   queryFn: () => fetchPosts(clubNumber),
  //   keepPreviousData: true,
  // });

  // const handleSelect = (id, category) => {
  //   setSelectedItemId(id);
  //   setSelectedItemCategory(category);
  //   setOpenDialog(true);
  // };

  // const handleClose = () => {
  //   setOpenDialog(false);
  //   setSelectedItemId(null);
  //   setSelectedItemCategory('');
  // };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>데이터를 가져오는 중 오류 발생: {error.message}</p>;

  // 선택된 카테고리에 따라 필터링
  const filteredItems = items.filter((item) => selectedCategory === "전체" || item.category === selectedCategory);

  return (
    <Container>
      <Box sx={{ "& button": { m: 1 } }}>
        <Button
          variant={selectedCategory === "전체" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("전체")}
          sx={{
            bgcolor: selectedCategory === "전체" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "전체" ? "#fff" : "#000",
            borderColor: selectedCategory === "전체" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          전체
        </Button>
        <Button
          variant={selectedCategory === "공지사항(전체알림)" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("공지사항(전체알림)")}
          sx={{
            bgcolor: selectedCategory === "공지사항(전체알림)" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "공지사항(전체알림)" ? "#fff" : "#000",
            borderColor: selectedCategory === "공지사항(전체알림)" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          공지
        </Button>
        <Button
          variant={selectedCategory === "자유글" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("자유글")}
          sx={{
            bgcolor: selectedCategory === "자유글" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "자유글" ? "#fff" : "#000",
            borderColor: selectedCategory === "자유글" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          자유
        </Button>
        <Button
          variant={selectedCategory === "관심사공유" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("관심사공유")}
          sx={{
            bgcolor: selectedCategory === "관심사공유" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "관심사공유" ? "#fff" : "#000",
            borderColor: selectedCategory === "관심사공유" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          관심사
        </Button>
        <Button
          variant={selectedCategory === "모임후기" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("모임후기")}
          sx={{
            bgcolor: selectedCategory === "모임후기" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "모임후기" ? "#fff" : "#000",
            borderColor: selectedCategory === "모임후기" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          모임후기
        </Button>
        <Button
          variant={selectedCategory === "가입인사" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("가입인사")}
          sx={{
            bgcolor: selectedCategory === "가입인사" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "가입인사" ? "#fff" : "#000",
            borderColor: selectedCategory === "가입인사" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          가입인사
        </Button>
        <Button
          variant={selectedCategory === "투표" ? "contained" : "outlined"}
          size="small"
          onClick={() => handleCategoryClick("투표")}
          sx={{
            bgcolor: selectedCategory === "투표" ? "#DBC7B5" : "transparent",
            color: selectedCategory === "투표" ? "#fff" : "#000",
            borderColor: selectedCategory === "투표" ? "#DBC7B5" : "#BDC0C8", // 아웃라인 색상
            "&:hover": {
              bgcolor: "#A67153",
              borderColor: "#A67153",
              color: "#fff",
            },
          }}
        >
          투표
        </Button>
      </Box>
      <List>
        {filteredItems.map((item) => (
          <React.Fragment key={item._id}>
            <ListItem button onClick={() => handleSelect(item._id, item.options && item.options.length > 0 ? "투표" : "게시물", item.title)}>
              <ListItemText primary={item.title} secondary={`${item.category || " 투표 "} ${item.endTime ? `종료시간: ${new Date(item.endTime).toLocaleString()}` : ""}`} />
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      {/* 모달 구현 */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{selectedItemCategory === "투표" ? null : dialogTitle}</DialogTitle>
        <DialogContent>
          {selectedItemCategory === "투표" && <ReadVote voteId={selectedItemId} title={dialogTitle} onDelete={() => handleClose()} />}
          {selectedItemCategory === "게시물" && <Read postId={selectedItemId} title={dialogTitle} onClose={() => handleClose()} />}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ListPosts;
