// ClubCarousel.js
import React from "react";
import Slider from "react-slick";
import ClubCard from "./ClubCard"; // ClubCard 컴포넌트의 경로를 맞게 조정
import { borderRadius, Box } from "@mui/system";

// 슬릭 설정을 위한 기본 옵션
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1, // 화면에 한 번에 보여줄 카드 수
  centerMode: true, // 중앙 정렬 활성화
  centerPadding: "40px", // 조정된 값
  slidesToScroll: 1,
  arrows: true, // 화살표 버튼 활성화
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const ClubCarousel = ({ clubList }) => {
  return (
    <Box style={{ padding: "20px", backgroundColor: "#f2f2f2", borderRadius: "20px" }}>
      <Slider {...settings}>
        {clubList.map((club) => (
          <Box key={club._id} style={{ padding: "10px" }}>
            <ClubCard clubList={[club]} />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ClubCarousel;
