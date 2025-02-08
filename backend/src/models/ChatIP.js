const mongoose = require("mongoose");

// 배열의 길이를 제한하는 검증 함수
function arrayLimit(val) {
  return val.length <= 5; // 배열 길이가 3 이하인 경우만 허용
}


// IP 기록을 저장하는 스키마 정의
const ChatIPSchema = new mongoose.Schema({
  // 관련 사용자
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ipRecords: {
    type: [
      {
        // IP 주소
        ip: {
          type: String,
          required: true,
        },
        // IP가 기록된 시간
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    validate: [arrayLimit, "IP 기록의 배열 길이는 최대 3개까지 허용됩니다."], // 배열 길이 제한 및 오류 메시지
  },
});

module.exports = mongoose.model("ChatIP", ChatIPSchema);
