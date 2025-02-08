const nodemailer = require('nodemailer'); // Nodemailer를 사용해 이메일 전송
const AuthCode = require('../models/authCodes'); 
const emailTemplate = require('./emailTemplate');

// SMTP 설정
const smtpTransport = nodemailer.createTransport({
    pool: true,
    maxConnection: 10,
    maxMessages: 10, // 최대 10개의 메시지
    service: 'never',
    host: 'smtp.naver.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 주어진 범위 내에서 임의의 정수 생성
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 임의의 9자리 문자열 생성
const generateCodeId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// 이메일을 통해 인증번호를 전송하는 함수
exports.sendAuthEmail = async (req, res) => {
    const codeId = generateCodeId(); // 고유한 인증 코드 ID 생성
    const number = generateRandomNumber(111111, 999999); // 인증번호 생성
    const { email } = req.body; // 요청 본문에서 이메일 주소 가져오기

    const expires = Date.now() + 3 * 60 * 1000; // 3분 후 만료
    const now = Date.now();

    try {
        // 새로운 인증 코드 데이터 삽입
        const authCode = new AuthCode({
            email,
            codeId,
            number,
            expires,
            requestAt: now,
            requestCount: 1 // 요청 카운트 초기화
        });

        await authCode.save();

        // HTML 템플릿을 문자열로 설정
        const htmlContent = emailTemplate(number); // 템플릿 파일에서 HTML 내용 읽기

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Clubing 인증 메일입니다.",
            html: htmlContent, // HTML 문자열을 직접 사용
        };

        await smtpTransport.sendMail(mailOptions);
        res.json({ ok: true, codeId, authNum: number }); // 응답에 새 인증 코드와 번호 포함
    } catch (err) {
        console.error('메일 전송 오류:', err);
        res.status(500).json({ ok: false, msg: '메일 전송에 실패하였습니다.', error: err.message }); // 500 상태 코드로 수정
    } 
    // finally {
    //     smtpTransport.close(); // SMTP 연결 종료
    // }
};
