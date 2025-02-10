const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/auth/callback', async (req, res) => {
    const { code } = req.body;
    console.log('Received codea:', code);
    try {
        const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
            grant_type: 'authorization_code',
            client_id: process.env.REACT_APP_KAKAO_API_URL,
            redirect_uri: 'http://localhost:3000/kakao/callback',  // 여기도 프론트엔드 주소로 설정
            code,
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });

   
        const accessToken = response.data.access_token;
        console.log("Access Token:", response.data.access_token);
        
        res.json(response.data);  // 액세스 토큰 클라이언트에 전달

    } catch (error) {
        console.error("토큰 요청 실패:", error);
        res.status(500).json({ error: 'Token request failed' });
    }
});

module.exports = router;