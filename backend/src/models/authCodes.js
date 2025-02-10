const { default: mongoose } = require("mongoose");
const nodemailer = require('nodemailer');

// MongoDB 모델 정의
const authCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    codeId: { type: String, required: true },
    number: { type: Number, required: true },
    expires: { type: Date, required: true },
    lastRequestAt: { type: Date, default: Date.now },
    requestCount: { type: Number, default: 0 }
  });

const AuthCode = mongoose.model('AuthCode', authCodeSchema);

module.exports = AuthCode;