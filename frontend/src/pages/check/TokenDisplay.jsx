import React, { useEffect, useState } from 'react';

const TokenDisplay = () => {
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // 요청을 보내는 엔드포인트 (토큰이 포함된 응답을 반환하는 엔드포인트)
        const response = await fetch('http://localhost:4000/', {
          method: 'GET',
          credentials: 'include', // 쿠키를 포함하여 요청하기 위해 추가
        });

        const resHeaders = response.headers; // 응답 헤더 가져오기
        const tokenObj = {
        resHeaders: response.headers,
        accessToken: resHeaders.get('Authorization'), // Authorization 헤더에서 액세스 토큰 가져오기
        refreshToken: resHeaders.get('Refresh-Token'), // Refresh-Token 헤더에서 리프레시 토큰 가져오기
        };

        setTokenData(tokenObj); // 토큰 값을 상태에 저장
      } catch (error) {
        console.error("헤더에서 토큰 가져오기 실패:", error);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div>
      <h2>토큰 값 확인</h2>
      {tokenData ? (
        <pre>{JSON.stringify(tokenData, null, 2)}</pre> // JSON 형식으로 토큰 출력
      ) : (
        <p>토큰을 가져오는 중...</p>
      )}
    </div>
  );
};

export default TokenDisplay;
