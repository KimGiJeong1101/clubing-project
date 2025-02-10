import { Box, Fab, Grid, Modal, Typography } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import ScubaDivingIcon from "@mui/icons-material/ScubaDiving";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import StarIcon from "@mui/icons-material/Star";
import FlightIcon from "@mui/icons-material/Flight";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import CelebrationIcon from "@mui/icons-material/Celebration";
import SavingsIcon from "@mui/icons-material/Savings";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import React from "react";

const MeetingCreate1 = ({ open, handleCloseModal, FadHandleClick }) => {
  const categories = [
    { color: "#71ABF0", icon: <FastfoodIcon sx={{ width: "70px", height: "70px" }} />, text: "푸드·드링크" },
    { color: "#DC6A5A", icon: <MenuBookIcon sx={{ width: "70px", height: "70px" }} />, text: "자기계발" },
    { color: "#9363D1", icon: <StarIcon sx={{ width: "70px", height: "70px" }} />, text: "취미" },
    { color: "#D7E56E", icon: <FlightIcon sx={{ width: "70px", height: "70px" }} />, text: "액티비티" },
    { color: "#EE7E8C", icon: <CelebrationIcon sx={{ width: "70px", height: "70px" }} />, text: "파티" },
    { color: "#4C5686", icon: <Diversity3Icon sx={{ width: "70px", height: "70px" }} />, text: "소셜게임" },
    { color: "#F7D16E", icon: <SavingsIcon sx={{ width: "70px", height: "70px" }} />, text: "문화·예술" },
    { color: "#C25BA1", icon: <CastForEducationIcon sx={{ width: "70px", height: "70px" }} />, text: "N잡·재테크" },
    { color: "#DEB650", icon: <FavoriteOutlinedIcon sx={{ width: "70px", height: "70px" }} />, text: "연애·사랑" },
    { color: "#78C17C", icon: <FastfoodIcon sx={{ width: "70px", height: "70px" }} />, text: "여행·나들이" },
    { color: "#828ED6", icon: <ScubaDivingIcon sx={{ width: "70px", height: "70px" }} />, text: "동네·또래" },
    { color: "#8E44AD", icon: <BrushIcon sx={{ width: "70px", height: "70px" }} />, text: "외국어" },
  ];

  return (
    <Box>
      <Modal open={open} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box
          sx={{
            borderRadius: "30px",
            border: "2px #565903 solid ",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: 520,
            width: 650,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{ textAlign: "center", marginBottom: "20px", color: "#565903" }}>
            관심사 선택
          </Typography>
          <Grid container spacing={2}>
            {categories.map((item, index) => (
              <Grid item xs={3} container justifyContent="center" alignItems="center" key={index}>
                <Box
                  onClick={() => {
                    FadHandleClick(item.text);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      backgroundColor: item.color,
                      width: "100px",
                      height: "100px",
                      borderRadius: "50px",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "8px",
                      transition: "background-color 0.3s",
                      "&:hover": {
                        backgroundColor: item.color + "BF", // Slightly darker color on hover
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography sx={{ textAlign: "center", fontSize: "18px", fontWeight: "550" }}>{item.text}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default MeetingCreate1;
