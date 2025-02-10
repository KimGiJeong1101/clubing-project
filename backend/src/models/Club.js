const { default: mongoose } = require("mongoose");
const { getNextSequenceValue } = require("../util/sequence");

const clubSchema = mongoose.Schema({
  _id: {
    type: Number,
    default: 0,
  },
  mainCategory: {
    type: String, //텝 , 문화예술 , 재테크 , 외국어 , 연애.사랑 이런거
  },
  subCategory: {
    type: [String], //텝 , 문화예술 , 재테크 , 외국어 , 연애.사랑 이런거
  },
  title: {
    type: String, //제목 - 한달에 카페 몇번 가기
  },
  subTitle: {
    type: String, //제목 - 카페 , 우애
  },
  content: {
    type: String, // 설명글
  },
  region: {
    type: {
      city: { type: String }, // 시
      district: { type: String }, // 구
      neighborhood: { type: String }, // 동
    },
    // 객체 배열
  },
  wish: {
    type: Number, // 좋아요 수
    default: 0,
  },
  img: {
    type: String, // 대표사진
  },
  admin: {
    type: String, // 방장
  },
  adminNickName: {
    type: String, // 방장 닉네임
  },
  members: {
    type: [String], //여기서 현재 인원
  },
  maxMember: {
    type: Number, // 최대 인원
  },
  meeting: {
    type: [Object],
  },
  sysDate: {
    type: Date, // 만든 날짜
    default: Date.now, // 자동으로 현재 시간 설정
  },
  wishHeart: {
    type: [String], // 문자열 배열로 변경
    default: [], // 기본값은 빈 배열
  },
  memberInfo: {
    type: [
      {
        name: String,
        nickName: String,
        thumbnailImage: String,
      },
    ],
    default: [], // 기본값은 빈 배열
  },
  manager: {
    type: [String],
  },
});

// 이거 기억할 수 있나.. 하튼 이거 자동 증가하는 거 추가하는 중 프리 + 이거 벨류 +

clubSchema.pre("save", async function (next) {
  if (this.isNew) {
    this._id = await getNextSequenceValue("clubId");
  }
  next();
});

const Club = mongoose.model("Club", clubSchema);

module.exports = Club;
