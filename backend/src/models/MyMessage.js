const mongoose = require("mongoose");

// 메시지 스키마 정의
const messageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true, // 메시지 내용은 필수
  },
  content: {
    type: String,
    required: true, // 메시지 내용은 필수
  },
  date: {
    type: Date,
    default: Date.now, // 기본값으로 현재 날짜
  },
  isRead: {
    type: Boolean,
    default: false, // 기본값은 읽지 않음
  },
  recipient: {
    type: String,
    required: true, // 수신자는 필수
  },
  sender: {
    type: String,
    required: true, // 발신자는 필수
  },
  club: {
    type: Number,
    default: null, // 클럽 ID, 클럽과 관련 없는 메시지는 null 가능
  },
});

// 메시지 모델 생성
const MyMessage = mongoose.model("MyMessage", messageSchema);

module.exports = MyMessage;
