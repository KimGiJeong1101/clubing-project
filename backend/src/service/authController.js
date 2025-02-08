const { sendAuthEmail } = require('./emailSend');
const { verifyAuthCode } = require('./emailAuth');

exports.sendAuthEmail = async (req, res) => {
    try {
        await sendAuthEmail(req, res);
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ ok: false, msg: '서버 오류', error: error.message });
    }
};
exports.verifyAuthCode = async (req, res) => {
    try {
        await verifyAuthCode(req, res);
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ ok: false, msg: '서버 오류' });
    }
};