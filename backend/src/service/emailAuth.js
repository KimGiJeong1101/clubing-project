const AuthCode = require('../models/authCodes'); // MongoDB 모델 가져오기

exports.verifyAuthCode = async (req, res) => {
    try {
        // 요청 본문에서 데이터 추출
        const { email, inputCode, codeId } = req.body;

        // 필수 데이터 확인
        if (!codeId || !inputCode || !email) {
            return res.status(400).json({ ok: false, msg: '필요한 데이터가 누락되었습니다.' });
        }
       
        // MongoDB에서 인증 데이터 조회
        const authData = await AuthCode.findOne({ email, codeId });
        
         // 인증 데이터가 없으면 오류 응답
         if (!authData) {
            return res.status(400).json({ ok: false, msg: '인증번호가 유효하지 않습니다.' });
        }

        // 인증번호 만료 여부 확인
        if (Date.now() > authData.expires) {
            await AuthCode.deleteOne({ email, codeId }); // 만료된 인증번호 삭제
            return res.status(400).json({ ok: false, msg: '인증번호가 만료되었습니다.' });
        }

        // 입력된 인증번호를 숫자로 변환하여 비교
        const inputCodeAsNumber = parseInt(inputCode, 10);

        // 입력된 인증번호와 저장된 인증번호 비교
        if (authData.number === inputCodeAsNumber) {
            await AuthCode.deleteOne({ email, codeId }); // 인증번호 사용 후 삭제
            return res.json({ ok: true, msg: '인증이 완료되었습니다.' });
        } else {
            return res.status(400).json({ ok: false, msg: '인증번호가 일치하지 않습니다.' });
        }
    } catch (error) {
        console.error('서버 오류:', error);
        return res.status(500).json({ ok: false, msg: '서버 오류가 발생했습니다.' });
    }
};