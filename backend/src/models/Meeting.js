const { default: mongoose } = require("mongoose");
const { getNextSequenceValue } = require("../util/sequence");

const meetingSchema = mongoose.Schema({
  _id: {
    type: Number,
    default: 0,
  },
  clubNumber: {
    type: Number,
  },
  title: {
    type: String, // 정모 제목
  },
  dateTime: {
    type: String, // 만나는 날짜 및 시간
  },
  dateTimeSort: {
    type: Date, // 만나는 날짜 및 시간
  },
  category: {
    type: String, // 문화예술 , 재테크 , 외국어 , 연애.사랑 이런거
  },
  where: {
    type: String, // 어디서 만날지
  },
  totalCount: {
    type: Number, // 전체 인원수
  },
  joinMember: {
    type: [String], // 참여 인원 이메일
    default: [],
  },
  cost: {
    type: String, // 비용
  },
  alertAll: {
    type: Boolean, // 설명글
  },
  img: {
    type: String, // 사진설정
  },
  joinMemberInfo: {
    type: [
      {
        name: String,
        nickName: String,
        thumbnailImage: String,
      },
    ],
    default: [], // 기본값은 빈 배열
  },
});
meetingSchema.pre("save", async function (next) {
  if (this.isNew) {
    this._id = await getNextSequenceValue("meetingId");
  }
  next();
});

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
