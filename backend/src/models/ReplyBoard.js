const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replyBSchema = new Schema(
  {
    postId: {
      type: Number,
      required: true,
    },
    postType: {
      type: String,
      required: true,
      enum: ["Gallery", "Board", "OtherModel"],
    },
    writer: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    parentReplyId: {
      type: Schema.Types.ObjectId,
      ref: "Reply", // 부모 댓글을 참조하는 필드
      default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply", // 자식 댓글을 참조하는 필드
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 모델이 이미 존재하는지 확인한 후, 정의합니다.
const ReplyB = mongoose.models.ReplyB || mongoose.model("BpardReply", replyBSchema);

module.exports = ReplyB;
