import { Box, Button, Grid, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import clubCategories from "./../main/CategoriesDataClub";

const CategoryModalSub = ({ open, onClose, onSubCategorySelect, mainCategory }) => {
  const [subCategory, setSubCategory] = useState(clubCategories);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const buttonStyle = {
    fontSize: "1rem",
    width: "100px", // 너비 조정
    height: "50px", // 높이 조정
    margin: "15px 0px 10px 0px",
    borderRadius: "8px", // 네모박스 모서리 조정
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // 그림자 효과 추가
  };

  //카테고리 열었을 때 , 서브카테고리 초기화
  useEffect(() => {
    setSelectedCategories([]);
  }, [open]);
  //카테고리 열었을 때 , 서브카테고리 초기화 .end

  const handleCategoryClick = (category) => {
    setSelectedCategories((prevCategories) => {
      // Check if the category is already selected
      if (prevCategories.includes(category)) {
        // Remove the category if it is already selected
        return prevCategories.filter((cat) => cat !== category);
      } else {
        // Add the category if not selected and limit to 2
        if (prevCategories.length < 2) {
          return [...prevCategories, category];
        }
        return prevCategories;
      }
    });
  };

  const ButtonHandleClick = (event) => {
    const ariaLabel = event.currentTarget.getAttribute("aria-label");
    handleCategoryClick(ariaLabel);
  };

  const handleSelectComplete = () => {
    console.log(selectedCategories); // 이 부분 추가
    onSubCategorySelect(selectedCategories); // Pass selected categories
    onClose(); // Close modal after selection
  };

  useEffect(() => {
    if (mainCategory && subCategory[mainCategory]) {
      setSubCategoryList(subCategory[mainCategory]); // Update subCategoryList based on mainCategory
    }
  }, [mainCategory, subCategory]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          console.log("Modal closed");
          onClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: 630,
            width: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{ textAlign: "center" }}>
            관심사 선택
          </Typography>
          <br />
          <hr />
          <Grid container spacing={2}>
            {subCategoryList.map((item, index) => (
              <Grid item xs={2} key={index} container justifyContent="center" alignItems="center">
                <Button aria-label={item} onClick={ButtonHandleClick} sx={buttonStyle} style={{ color: selectedCategories.includes(item) ? "white" : "green", backgroundColor: selectedCategories.includes(item) ? "green" : "transparent" }}>
                  {item}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                console.log("Button clicked!"); // 클릭 여부 확인
                handleSelectComplete();
              }}
              disabled={selectedCategories.length === 0}
            >
              선택 완료
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CategoryModalSub;
