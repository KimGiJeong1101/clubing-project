const mongoose = require("mongoose");

// ChatRoom 스키마
const chatRoomSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.Number,
    ref: "Club",
    required: true,
    unique: true,
  },
  title: {
    type: String,
    // required 속성 제거 (선택 사항으로 만듦)
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now, // 사용자가 참가한 시간 기록
      },
    },
  ],
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;
