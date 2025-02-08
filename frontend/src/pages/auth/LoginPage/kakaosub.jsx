import React, { useEffect, useState } from 'react';
import axios from 'axios';

const KakaoCallback = () => {
  const [authorizationCode, setAuthorizationCode] = useState(null);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code"); // URL에서 인가 코드 추출
    console.log("code :", code);
    if (code) {
      setAuthorizationCode(code); // 상태 업데이트
      handleTokenRequest(code); // 액세스 토큰 요청
    }
  }, []);

  const handleTokenRequest = async (code) => {
    try {
      // 백엔드 API 호출
      const response = await axios.post(`http://localhost:4000/kakao/auth/callback`, {
        code, // 인가 코드를 백엔드로 전달
      });
  
      // 액세스 토큰 처리 등 후속 작업
      console.log("Access Token Response:", response.data);
    } catch (error) {
      console.error("토큰 요청 실패:", error);
    }
  };

  return (
    <div>
      {authorizationCode ? (
        <p>로그인 성공! 인가 코드: {authorizationCode}</p>
      ) : (
        <p>로그인 중...</p>
      )}
    </div>
  );
};

export default KakaoCallback;
