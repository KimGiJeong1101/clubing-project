import React, { useState } from "react";
import { Box } from "@mui/material";

const AnimatedCard = ({ image }) => {
  const [transform, setTransform] = useState(
    "perspective(350px) rotateX(0deg) rotateY(0deg)"
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    const rotateY = ((x - halfWidth) / halfWidth) * 20;
    const rotateX = -((y - halfHeight) / halfHeight) * 20;

    setTransform(
      `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  };

  const handleMouseOut = () => {
    setTransform("perspective(350px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <Box
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseOut}
      sx={{
        position: "absolute", // 부모 요소에 맞추기 위해 절대 위치 사용
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        transform: transform,
        transition: "transform 0.2s ease",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
      }}
    >
      <Box
        component="img"
        src={image}
        alt=""
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // 이미지가 컨테이너를 덮도록 설정
        }}
      />
    </Box>
  );
};

export default AnimatedCard;
