import React, { useRef } from "react";
import Slider from "react-slick";
import ClubCard from "./ClubCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ClubCarousel = ({ clubList }) => {
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="relative">
      {/* 좌측 버튼 */}
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
        aria-label="이전"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {/* 슬라이더 */}
      <div className="mx-4">
        <Slider ref={sliderRef} {...settings}>
          {clubList.map((club) => (
            <div key={club._id} className="px-1.5">
              <ClubCard club={club} />
            </div>
          ))}
        </Slider>
      </div>

      {/* 우측 버튼 */}
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
        aria-label="다음"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ClubCarousel;
