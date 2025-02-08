import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { kakaoLoginUser } from '../../../store/actions/userActions'; 

const KakaoCallback = () => {
    const dispatch = useDispatch();
  const [authorizationCode, setAuthorizationCode] = useState(null);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code"); // URL에서 인가 코드 추출
    console.log("code :", code);
    if (code) {
      setAuthorizationCode(code); // 상태 업데이트
      dispatch(kakaoLoginUser(code)); // 액션 호출
    }
  }, [dispatch]); // dispatch를 의존성 배열에 추가

  return (
    <div>
        <p>로그인 중...</p>
    </div>
  );
};

export default KakaoCallback;
