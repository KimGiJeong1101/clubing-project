import React from "react";
import Slider from "react-slick";
import ClubCard3Invite from "./ClubCard3Invite";

const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  centerMode: true,
  centerPadding: "10px",
  slidesToScroll: 3,
  arrows: true,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  ],
};

const ClubCarousel3 = ({ clubList }) => {
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < clubList.length; i += chunkSize) {
    chunks.push(clubList.slice(i, i + chunkSize));
  }

  return (
    <div className="p-5 bg-gray-100 rounded-2xl">
      <Slider {...settings}>
        {chunks.map((chunk, index) => (
          <div key={index} className="flex flex-row">
            {chunk.map((club) => (
              <div key={club._id} className="px-2.5">
                <ClubCard3Invite clubList={[club]} />
              </div>
            ))}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ClubCarousel3;
