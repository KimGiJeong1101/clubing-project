const mongoose = require('mongoose');

const recentVisitSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  clubs: {
    type: [Number], // 클럽 ID 배열
    default: [], // 기본값 빈 배열
    validate: [arrayLimit, '{PATH} exceeds the limit of 9'], // 최대 9개 제한
  },
  date: {
    type: Date,
    default: Date.now, // 기본값 현재 날짜
  },
});

// 배열 길이 제한(9개)
function arrayLimit(val) {
  return val.length <= 6;
}

const RecentVisit = mongoose.model('RecentVisit', recentVisitSchema);

module.exports = RecentVisit;
