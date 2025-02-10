const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const Board = require("../models/ClubBoard");
const Event = require("../models/Event");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mime = require("mime-types");
const { v4: uuid } = require("uuid");
const User = require("../models/User");

// Upload directory
const uploadDir = path.join(__dirname, "../../upload");

// Date formatting function
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateFolder = getFormattedDate();
    const fullPath = path.join(uploadDir, dateFolder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid()}.${mime.extension(file.mimetype)}`);
  },
});

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("해당 파일의 형식을 지원하지 않습니다."), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});

// 이미지 업로드 라우터
router.post("/upload", upload.single("file"), (req, res) => {
  console.log("이미지 업로드 요청 받음");
  res.status(200).json(req.file);
});

// 이미지 조회 라우터
router.get("/image/:filename", (req, res) => {
  const { filename } = req.params;
  const dateFolder = filename.split("_")[0]; // 파일명에서 날짜 폴더 추출 (가정)
  const filePath = path.join(uploadDir, dateFolder, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

router.post("/newEvent", auth, async (req, res) => {
  try {
    // request body를 출력하여 전달된 데이터를 확인
    console.log(req.body);

    const { writer, title, content, cardImage, cardTitle, endTime } = req.body;

    // writer가 있는지 확인
    const user = await User.findOne({ email: writer });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 관리자 권한 확인
    const roleNumber = user.roles;
    if (roleNumber !== 0) {
      return res.status(403).json({ error: "관리자만 이용할 수 있습니다." });
    }

    // 제목과 내용이 제대로 전달되었는지 확인
    if (!title || !content) {
      return res.status(400).send("제목과 내용을 입력해주세요.");
    }

    // 새로운 이벤트 생성
    const newEvent = new Event({
      writer: user._id,
      title,
      content,
      cardImage,
      cardTitle,
      endTime,
    });

    await newEvent.save(); // 데이터베이스에 이벤트 저장
    console.log("글등록성공");
    res.status(200).send("Content received and saved");
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).send("Failed to save content");
  }
});

// 이벤트 리스트 API
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }); // 최신 순으로 정렬
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Failed to fetch events");
  }
});

// 이벤트 삭제 API
router.delete("/:id", auth, async (req, res) => {
  const eventId = req.params.id;
  const { email } = req.body; // request body에서 email 가져옴

  console.log(`삭제 요청 받음: eventId=${eventId}, email=${email}`); // 디버그 로그 추가

  try {
    // 사용자 정보 가져오기
    const user = await User.findOne({ email });
    if (!user) {
      console.error("사용자를 찾을 수 없습니다.");
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 관리자 권한 확인
    if (user.roles !== 0) {
      console.error("관리자 권한이 없습니다.");
      return res.status(403).json({ error: "관리자만 삭제할 수 있습니다." });
    }

    // 삭제할 이벤트 찾기
    const event = await Event.findById(eventId);
    if (!event) {
      console.error("이벤트를 찾을 수 없습니다.");
      return res.status(404).json({ error: "이벤트를 찾을 수 없습니다." });
    }

    // 이벤트 삭제 (event.remove 대신 findByIdAndDelete 사용)
    await Event.findByIdAndDelete(eventId);
    console.log(`이벤트 삭제됨: ${eventId}`);

    res.status(200).json({ message: "이벤트가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("이벤트 삭제 중 오류 발생:", error); // 오류 로그 추가
    res.status(500).json({ error: "이벤트 삭제를 실패하였습니다." });
  }
});

//조회수 증가 api
router.patch("/:id/views", async (req, res) => {
  const eventId = req.params.id;

  try {
    // 이벤트 찾기
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "이벤트를 찾을 수 없습니다." });
    }

    // 조회수 증가
    event.views = (event.views || 0) + 1;
    await event.save();
    res.status(200).json({ message: "조회수가 증가되었습니다.", views: event.views });
  } catch (error) {
    console.error("조회수 증가 중 오류 발생:", error);
    res.status(500).json({ error: "조회수 증가를 실패하였습니다." });
  }
});

// 이벤트 조회 API (GET)
router.get("/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    console.log(`Received request to fetch event with ID: ${eventId}`);

    // 이벤트 찾기
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "이벤트를 찾을 수 없습니다." });
    }

    // User 컬렉션에서 writer(작성자)를 찾아 nickname을 가져옴
    const user = await User.findById(event.writer);
    if (!user) {
      return res.status(404).json({ error: "작성자를 찾을 수 없습니다." });
    }
    console.log(user.nickName);
    // 이벤트 데이터를 클라이언트로 보낼 때, writer 필드를 nickname으로 변경
    const eventWithNickname = {
      ...event._doc, // 기존 이벤트 데이터 복사
      writer: user.nickName, // writer를 nickname으로 대체
    };

    res.status(200).json(eventWithNickname);
  } catch (error) {
    console.error("이벤트 조회 중 오류 발생:", error);
    res.status(500).json({ error: "이벤트 조회를 실패하였습니다." });
  }
});

// 이벤트 수정 API
router.put("/:id", auth, async (req, res) => {
  const eventId = Number(req.params.id); // eventId를 Number로 변환
  console.log("받은 eventId:", eventId); // eventId 확인

  if (isNaN(eventId)) {
    console.log("유효하지 않은 이벤트 ID:", eventId); // 유효하지 않은 ID일 때 로그
    return res.status(400).json({ error: "유효하지 않은 이벤트 ID입니다." });
  }

  const { writer, title, content, cardTitle, cardImage, endTime } = req.body;
  console.log("받은 데이터:", { writer, title, content, cardTitle, cardImage, endTime }); // 받은 요청 데이터를 로그

  try {
    // writer 이메일로 사용자 정보 가져오기
    const user = await User.findOne({ email: writer });
    console.log("찾은 사용자:", user); // 사용자 정보 확인

    if (!user) {
      console.log("사용자 찾기 실패:", writer); // 사용자 찾기 실패 로그
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 관리자 권한 확인
    if (user.roles !== 0) {
      console.log("관리자 권한 없음:", user.roles); // 관리자 권한 실패 로그
      return res.status(403).json({ error: "관리자만 수정할 수 있습니다." });
    }

    // 수정할 이벤트 찾기 (Number 타입으로 조회)
    const event = await Event.findOne({ _id: eventId });
    console.log("찾은 이벤트:", event); // 수정할 이벤트 로그

    if (!event) {
      console.log("이벤트 찾기 실패:", eventId); // 이벤트 찾기 실패 로그
      return res.status(404).json({ error: "이벤트를 찾을 수 없습니다." });
    }

    // 이벤트 수정 로직 (필드가 존재할 경우에만 업데이트)
    if (title) event.title = title;
    if (content) event.content = content;
    if (cardTitle) event.cardTitle = cardTitle;
    if (cardImage) event.cardImage = cardImage;
    if (endTime) event.endTime = endTime;

    console.log("수정된 이벤트 데이터:", event); // 수정된 이벤트 로그

    // 수정된 이벤트 저장
    await event.save();

    console.log(`이벤트 수정됨: ${eventId}`);
    res.status(200).json({ message: "이벤트가 성공적으로 수정되었습니다.", event });
  } catch (error) {
    console.error("이벤트 수정 중 오류 발생:", error); // 오류 로그
    res.status(500).json({ error: "이벤트 수정을 실패하였습니다." });
  }
});

module.exports = router;
