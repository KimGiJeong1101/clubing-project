import React from "react";
import { Card, CardActions, Button, Avatar, Typography, Box, IconButton, Divider } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useNavigate } from "react-router-dom";

const HomeCard = ({ club }) => {
  const navigate = useNavigate();

  if (!club) {
    return <div>No club data available</div>;
  }

  const { adminImage, memberImages, title, subTitle, img } = club;

  const fullImageUrl = img ? `http://localhost:4000/${img}` : "https://via.placeholder.com/320x150";

  return (
    <Card variant="outlined" sx={{ width: 250, height: 200, borderRadius: 2, borderColor: "#d0d7de", margin: 1 }}>
      <Box
        sx={{
          height: 120, // 높이 조정
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundImage: `url(${fullImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            alt="Admin"
            src={adminImage || "https://via.placeholder.com/56"}
            sx={{
              width: 40, // 크기 조정
              height: 40, // 크기 조정
              border: "2px solid white",
            }}
          />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "white",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              }}
            >
              {title || "Unknown Club"}
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5}>
              {memberImages &&
                memberImages.slice(0, 3).map((image, idx) => (
                  <Avatar
                    key={idx}
                    src={image || "https://via.placeholder.com/24"}
                    sx={{
                      width: 20, // 크기 조정
                      height: 20, // 크기 조정
                      border: "1px solid white",
                    }}
                  />
                ))}
              {memberImages && memberImages.length > 3 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  +{memberImages.length - 3}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontSize: "10px", // 글씨 크기 조정
            mt: 1,
            color: "white",
            fontWeight: "bold",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
          }}
        >
          {subTitle || "No description available"}
        </Typography>
      </Box>

      <Divider />

      <CardActions>
        <IconButton aria-label="favorite">
          <FavoriteBorderIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}></Box>

        <ArrowForwardOutlinedIcon
          sx={{
            padding: "7px",
            paddingTop: "2px",
            color: "gray",
            ":hover": { cursor: "pointer" },
            fontSize: 24,
          }}
          onClick={() => navigate(`/clubs/main?clubNumber=${club._id}`)}
        ></ArrowForwardOutlinedIcon>

        {/* <Button
          size="small"
          variant="outlined"
          sx={{
            flexGrow: 1,
            backgroundColor: '#DBC7B5',
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#A67153',
              borderColor: 'black',
            },
          }}
        >
          View
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: '#6E3C21',
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#A67153',
            },
          }}
        >
          Join
        </Button> */}
      </CardActions>
    </Card>
  );
};

export default HomeCard;
