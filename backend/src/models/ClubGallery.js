const { default: mongoose, Schema } = require("mongoose");

const gallerySchema = new Schema(
  {
    clubNumber: {
      type: String, // 클럽 번호를 저장할 필드
      required: true, // 필수 값으로 설정
    },
    writer: {
      type: String,
      ref: "User",
    },
    title: {
      type: String,
      maxLength: 100,
      required: true,
    },
    content: {
      type: String,
      maxLength: 2000,
      required: true,
    },
    origin_images: {
      type: Array,
      default: [],
      required: true,
    },
    thumbnail_images: {
      type: Array,
      default: [],
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt과 updatedAt 필드를 자동으로 추가 및 관리
  }
);

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;
