// ClubCarousel2.js
import React from "react"; // 리액트 라이브러리 임포트
import Slider from "react-slick"; // 슬라이더(Slick Carousel) 컴포넌트 임포트
import ClubCard2 from "./ClubCard2"; // ClubCard 컴포넌트 임포트
import { Box } from "@mui/system"; // MUI의 Box 컴포넌트를 사용하여 레이아웃을 쉽게 구성하기 위한 임포트

// 슬릭(Slick) 슬라이더 설정 옵션
const settings = {
  dots: true, // 슬라이더 하단에 점(dot) 네비게이션을 표시
  infinite: false, // 슬라이더를 무한히 반복하지 않도록 설정
  speed: 500, // 슬라이더 전환 속도(밀리초)
  slidesToShow: 1, // 한 번에 화면에 보여줄 카드 개수
  centerMode: true, // 슬라이더 가운데에 카드를 정렬하여 보여줌
  centerPadding: "10px", // 슬라이더 중앙 패딩 설정 (카드 간 여백)
  slidesToScroll: 3, // 한 번에 3개씩 스크롤
  arrows: true, // 화살표 버튼 활성화
  responsive: [ // 반응형 설정 (화면 크기에 따라 슬라이더 옵션 변경)
    {
      breakpoint: 1024, // 화면 너비 1024px 이하일 때
      settings: {
        slidesToShow: 2, // 두 개의 카드를 보여줌
        slidesToScroll: 1, // 한 번에 한 개의 카드를 스크롤
      },
    },
    {
      breakpoint: 600, // 화면 너비 600px 이하일 때
      settings: {
        slidesToShow: 1, // 한 개의 카드를 보여줌
        slidesToScroll: 1, // 한 번에 한 개의 카드를 스크롤
      },
    },
  ],
};

// ClubCarousel2 컴포넌트: 클럽 리스트를 슬라이더 형태로 표시
const ClubCarousel2 = ({ clubList }) => {
   // 3개씩 나누기
   const chunkSize = 3;
   const chunks = [];
   for (let i = 0; i < clubList.length; i += chunkSize) {
     chunks.push(clubList.slice(i, i + chunkSize));
   }
 
   return (
     <Box style={{ padding: "20px", backgroundColor: "#f2f2f2", borderRadius: "20px" }}>
       {/* 청크 배열을 슬라이더로 표시 */}
       <Slider {...settings}>
         {chunks.map((chunk, index) => (
           <Box key={index} display="flex" flexDirection="row">
             {chunk.map((club) => (
               <Box key={club._id} style={{ padding: "10px" }}>
                 <ClubCard2 clubList={[club]} />
               </Box>
             ))}
           </Box>
         ))}
       </Slider>
     </Box>
   );
 };

export default ClubCarousel2; // ClubCarousel2 컴포넌트를 외부에서 사용할 수 있도록 export
