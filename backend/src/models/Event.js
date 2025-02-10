const mongoose = require("mongoose");
const { getNextSequenceValue } = require("../util/sequence");

const eventSchema = mongoose.Schema(
  {
    _id: Number,
    writer: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: { type: String, default: false },
    cardImage: {
      type: String,
      required: false,
    },
    cardTitle: {
      type: String,
      required: false,
    },
    views: {
      // 조회수 필드 추가
      type: Number,
      default: 0, // 기본값 0
    },
    endTime: {
      type: Date,
      required: false, // 필수로 설정하고 싶지 않다면 false로 변경하세요
    },
    isEdit: {
      type: String,
      require: false,
    },
  },
  { timestamps: true },
);

eventSchema.pre("save", async function (next) {
  if (this.isNew) {
    this._id = await getNextSequenceValue("eventId");
  }
  next();
});

// 조회수를 증가시키는 메서드
eventSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
