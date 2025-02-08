const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    // 쿠키에서 토큰을 가져오기
    const token = req.cookies.accessToken; // 쿠키 이름은 로그인 시 쿠키를 설정할 때 사용한 이름과 일치해야 합니다.

    if (!token) {
        return res.status(401).json({ error: '토큰이 없습니다. 로그인 후 다시 시도해 주세요.' });
    }

    try {
        // 토큰이 유효한지 검증
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ "_id": decode.userId });

        if (!user) {
            return res.status(400).send('없는 유저입니다.');
        }
        
        req.user = user; // 사용자를 req.user에 추가
        
        next();
    } catch (error) {
        console.error('토큰 검증 오류:', error);
        res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
};



module.exports = auth;