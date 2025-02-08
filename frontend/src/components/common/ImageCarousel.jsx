import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './ImageCarousel.css'; // 커스텀 CSS를 임포트

const ImageCarousel = ({ images }) => {
  return (
    <Carousel
      showThumbs={false}            // 슬라이드 하단에 썸네일을 표시하지 않습니다.
      infiniteLoop                  // 슬라이드가 끝없이 반복되도록 설정합니다.
      useKeyboardArrows             // 키보드 화살표 키를 사용하여 슬라이드를 이동할 수 있도록 합니다.
      autoFocus={true}              // 슬라이더에 자동으로 포커스가 가도록 설정합니다.
      showStatus={false}            // 슬라이드 번호 상태 표시를 제거합니다.
      showArrows={images.length > 1} // 이미지가 2개 이상일 때 화살표를 표시합니다.
      centerMode={false}            // 슬라이드를 중앙에 정렬하지 않도록 설정합니다.
    >
      {images.map((image, index) => (
        <div
          key={index}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <img
            src={image}
            alt={`slide-${index}`}
            style={{
              maxHeight: '500px',
              maxWidth: '100%',
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default ImageCarousel;
