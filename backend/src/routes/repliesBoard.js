const express = require("express");
const Reply = require("../models/ReplyBoard");
const router = express.Router();
const moment = require("moment-timezone");
const User = require("../models/User");

// 댓글 및 대댓글 등록 라우트
router.post("/add/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { postType, writer, comment, parentReplyId } = req.body; // parentReplyId 추가

    if (!postId || !postType || !writer || !comment) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // User 모델에서 작성자 정보 확인 (닉네임으로 유저 찾기)
    const user = await User.findOne({ nickName: writer });
    if (!user) {
      return res.status(404).json({ error: "작성자를 찾을 수 없습니다." });
    }

    // writer 필드에 닉네임 대신 이메일 저장
    const newReply = new Reply({
      postId,
      postType,
      writer: user.email, // 이메일을 저장
      comment,
      parentReplyId: parentReplyId || null, // 대댓글일 경우 부모 댓글 ID 저장
      createdAt: moment().tz("Asia/Seoul").toDate(),
    });

    await newReply.save();

    return res.status(201).json({ success: true, reply: newReply });
  } catch (error) {
    console.error("댓글 등록 중 에러 발생:", error.message);
    return res.status(500).json({ error: "서버 에러 발생." });
  }
});

// 특정 게시물의 모든 댓글을 불러오는 라우트 (대댓글 포함)
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // 부모 댓글만 가져옴 (parentReplyId가 null인 댓글)
    const parentReplies = await Reply.find({ postId, parentReplyId: null }).sort({ createdAt: -1 });

    // 부모 댓글에 해당하는 대댓글을 가져오고, 해당 댓글과 함께 반환
    const repliesWithChildren = await Promise.all(
      parentReplies.map(async (reply) => {
        // 해당 댓글에 대한 대댓글을 찾음
        const childReplies = await Reply.find({ parentReplyId: reply._id }).sort({ createdAt: 1 });

        // 이메일로 유저 정보 찾아서 닉네임과 프로필 이미지 추가
        const user = await User.findOne({ email: reply.writer });
        let writerNickName = "Unknown";
        let writerProfileImage = "default-profile.png";

        if (user) {
          writerNickName = user.nickName;
          writerProfileImage = user.profilePic ? user.profilePic.thumbnailImage : "default-profile.png";
        }

        // 부모 댓글과 대댓글을 함께 반환
        return {
          ...reply.toObject(),
          writerNickName,
          writerProfileImage,
          replies: await Promise.all(
            childReplies.map(async (childReply) => {
              const childUser = await User.findOne({ email: childReply.writer });
              return {
                ...childReply.toObject(),
                writerNickName: childUser ? childUser.nickName : "Unknown",
                writerProfileImage: childUser && childUser.profilePic ? childUser.profilePic.thumbnailImage : "default-profile.png",
              };
            }),
          ),
        };
      }),
    );

    return res.status(200).json({ success: true, replies: repliesWithChildren });
  } catch (error) {
    console.error("댓글 불러오기 중 에러 발생:", error.message);
    return res.status(500).json({ error: "서버 에러 발생." });
  }
});
// 댓글 삭제 라우트
router.delete("/delete/:replyId", async (req, res) => {
  try {
    const { replyId } = req.params;
    const { writer } = req.body; // 요청한 사용자의 닉네임을 req.body에서 가져옴

    // 사용자의 닉네임으로 이메일을 찾아서 댓글 작성자와 비교
    const user = await User.findOne({ nickName: writer });
    if (!user) {
      return res.status(404).json({ error: "해당 닉네임을 가진 사용자를 찾을 수 없습니다." });
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }

    // 댓글 작성자가 요청한 사용자의 이메일과 일치하는지 확인
    if (reply.writer !== user.email) {
      return res.status(403).json({ error: "댓글을 삭제할 권한이 없습니다." });
    }

    // 댓글 삭제
    await Reply.findByIdAndDelete(replyId);
    return res.status(200).json({ success: true, message: "댓글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 중 에러 발생:", error.message);
    return res.status(500).json({ error: "서버 에러 발생." });
  }
});

// 댓글 수정 라우트
router.put("/edit/:replyId", async (req, res) => {
  try {
    const { replyId } = req.params;
    const { writer, comment } = req.body; // 요청한 사용자의 닉네임과 수정할 댓글 내용을 req.body에서 가져옴

    if (!comment || !writer) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // 사용자의 닉네임으로 이메일을 찾아서 댓글 작성자와 비교
    const user = await User.findOne({ nickName: writer });
    if (!user) {
      return res.status(404).json({ error: "해당 닉네임을 가진 사용자를 찾을 수 없습니다." });
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }

    // 댓글 작성자가 요청한 사용자의 이메일과 일치하는지 확인
    if (reply.writer !== user.email) {
      return res.status(403).json({ error: "댓글을 수정할 권한이 없습니다." });
    }

    // 댓글 수정 (createdAt을 그대로 유지하고, updatedAt을 갱신)
    reply.comment = comment;
    reply.updatedAt = moment().tz("Asia/Seoul").toDate();

    await reply.save();

    return res.status(200).json({ success: true, message: "댓글이 성공적으로 수정되었습니다.", reply });
  } catch (error) {
    console.error("댓글 수정 중 에러 발생:", error.message);
    return res.status(500).json({ error: "서버 에러 발생." });
  }
});

module.exports = router;
