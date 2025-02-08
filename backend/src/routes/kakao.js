const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
    const { code } = req.body;
    //console.log('Received code:', code);
    try {
        // 액세스 토큰 요청
        const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.REACT_APP_KAKAO_API_URL,
                redirect_uri: 'http://localhost:3000/kakao/callback',
                code,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('리플레시 토큰도 있어?', response.data.refresh_token)
        console.log('토큰도 있어?', response.data.access_token)
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

         // 액세스 토큰 만료 시간 설정
        const accessTokenExpiry = Date.now() + response.data.expires_in * 1000; // 초 단위로 변환

        // 리프레시 토큰 만료 시간 설정
        const refreshTokenExpiry = Date.now() + response.data.refresh_token_expires_in * 1000; // 초 단위로 변환

        // 한국 표준시로 변환하는 함수
        const toKST = (utcTime) => {
            return new Date(utcTime + (9 * 60 * 60 * 1000)); // UTC 시간에 9시간 추가
        };

        // 만료 시간 출력
        console.log('액세스 토큰 만료 시간 (KST):', toKST(accessTokenExpiry).toLocaleString('ko-KR'));
        console.log('리프레시 토큰 만료 시간 (KST):', toKST(refreshTokenExpiry).toLocaleString('ko-KR'));

        // 사용자 정보 요청
        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };
        
        console.log('헤더값:', headers);
        
        const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers,
        });
 
        const userInfo = userInfoResponse.data;
        console.log("User Info:", userInfo);

        // 사용자 데이터베이스에 사용자 등록/업데이트
        const user = await User.findOne({ email: userInfo.kakao_account.email });

        if (!user) {
            // 사용자가 없으면 이메일 정보를 쿼리 파라미터로 포함하여 리디렉션
            console.log(`회원정보 없어서 이동 중: ${userInfo.kakao_account.email}`);
            const email = userInfo.kakao_account.email;
            return res.status(200).json({ redirectUrl: `http://localhost:3000/snsregister?email=${email}`});
        }
        // JWT 생성
        const payload = {
            userId: user._id.toHexString(),
        };
        console.log('뭐애??', payload);
        const accessTokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshTokenJWT = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // JWT를 쿠키에 저장
        res.cookie('accessToken', accessTokenJWT, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15분
            sameSite: 'Strict',
        });

        res.cookie('refreshToken', refreshTokenJWT, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            sameSite: 'Strict',
        });

        // 사용자 정보 응답
        // console.log("Received user:", user);
        return res.json({ user, message: '로그인 성공',  });
    } catch (error) {
        console.error("토큰 요청 실패:", error);
        res.status(500).json({ error: 'Token request failed' });
    }
});

module.exports = router;
