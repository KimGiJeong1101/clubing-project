import React, { useState } from "react";
import { styled } from "@mui/system";

const Wrapper = styled("div")({
  height: "100vh",
  width: "100vw",
  position: "absolute",
  top: 0,
  left: 0,
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
});

const Bubble = styled("div")(({ theme, clicked }) => ({
  height: "60px",
  width: "60px",
  border: "3px solid #A6836F",
  borderRadius: "50%",
  position: "absolute",
  animation: clicked ? "explode 0.5s forwards" : "animate 10s linear infinite",
  transition: "animation 0.5s ease",
  "&:nth-of-type(1)": { top: "20%", left: "20%", animationDuration: "8s" },
  "&:nth-of-type(2)": { top: "60%", left: "80%", animationDuration: "10s" },
  "&:nth-of-type(3)": { top: "40%", left: "40%", animationDuration: "3s" },
  "&:nth-of-type(4)": { top: "66%", left: "30%", animationDuration: "7s" },
  "&:nth-of-type(5)": { top: "90%", left: "10%", animationDuration: "9s" },
  "&:nth-of-type(6)": { top: "30%", left: "60%", animationDuration: "5s" },
  "&:nth-of-type(7)": { top: "70%", left: "20%", animationDuration: "8s" },
  "&:nth-of-type(8)": { top: "75%", left: "60%", animationDuration: "10s" },
  "&:nth-of-type(9)": { top: "50%", left: "50%", animationDuration: "6s" },
  "&:nth-of-type(10)": { top: "45%", left: "20%", animationDuration: "10s" },
  "&:nth-of-type(11)": { top: "10%", left: "90%", animationDuration: "9s" },
  "&:nth-of-type(12)": { top: "20%", left: "70%", animationDuration: "7s" },
  "&:nth-of-type(13)": { top: "20%", left: "20%", animationDuration: "8s" },
  "&:nth-of-type(14)": { top: "60%", left: "5%", animationDuration: "6s" },
  "&:nth-of-type(15)": { top: "90%", left: "80%", animationDuration: "9s" },
}));

const GlobalStyle = styled("style")({
  "@keyframes animate": {
    "0%": {
      transform: "scale(0) translateY(0) rotate(70deg)",
      opacity: 0.7,
    },
    "100%": {
      transform: "scale(1.3) translateY(-100px) rotate(360deg)",
      opacity: 0,
    },
  },
  "@keyframes explode": {
    "0%": {
      transform: "scale(1) translateY(0) rotate(0deg)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(3) translateY(-150px) rotate(720deg)",
      opacity: 0,
    },
  },
});

const BubbleAnimation = () => {
  const [bubbles, setBubbles] = useState(Array.from({ length: 15 }).map((_, index) => ({ id: index, clicked: false })));

  const handleClick = (id) => {
    setBubbles((prevBubbles) => prevBubbles.map((bubble) => (bubble.id === id ? { ...bubble, clicked: true } : bubble)));
  };

  return (
    <Wrapper>
      <GlobalStyle />
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          clicked={bubble.clicked}
          onClick={() => handleClick(bubble.id)}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 5}s`,
          }}
        />
      ))}
    </Wrapper>
  );
};

export default BubbleAnimation;
