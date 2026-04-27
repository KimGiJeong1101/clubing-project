import React, { useState } from "react";

const AnimatedCard = ({ image }) => {
  const [transform, setTransform] = useState("perspective(350px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 20;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 20;
    setTransform(`perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseOut = () => {
    setTransform("perspective(350px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseOut={handleMouseOut} style={{ transform, transition: "transform 0.2s ease" }} className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gray-100 rounded-lg">
      <img src={image} alt="" className="w-full h-full object-cover" />
    </div>
  );
};

export default AnimatedCard;
