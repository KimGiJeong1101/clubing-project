const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  clubId: {
    type: Number, // ObjectId 대신 clubId를 숫자 타입으로 설정
    ref: "ChatRoom", // ChatRoom의 clubId를 참조
    required: true,
    index: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: false,
  },
  images: [
    {
      original: { type: String },
      thumbnail: { type: String },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
