import React, { useEffect, useState } from 'react';
import TokenDisplay from "./TokenDisplay";

const HeaderDisplay = () => {
  const [headers, setHeaders] = useState({});

  useEffect(() => {
    // 현재 페이지의 헤더 값을 가져옵니다.
    const fetchHeaders = async () => {
      try {
        const response = await fetch('http://localhost:4000/', {
          method: 'GET',
          credentials: 'include', // 쿠키를 포함하여 요청하기 위해 추가
        });
        
        const resHeaders = response.headers; // 응답 헤더 가져오기
        const headersObj = {};
        resHeaders.forEach((value, key) => {
          headersObj[key] = value; // 키-값 쌍으로 객체에 저장
        });
        
        setHeaders(headersObj);
      } catch (error) {
        console.error("헤더 가져오기 실패:", error);
      }
    };

    fetchHeaders();
  }, []);

  return (
    <div>
      <h2>헤더 값 확인</h2>
      <pre>{JSON.stringify(headers, null, 2)}</pre> {/* JSON 형식으로 헤더 출력 */}
      <TokenDisplay /> {/* 토큰 값 확인을 위한 컴포넌트 */}
    </div>
  );
};

export default HeaderDisplay;
