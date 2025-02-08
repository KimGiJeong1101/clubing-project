const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const router = express.Router();

// 파일 저장 경로 설정
const uploadDir = path.join(__dirname, "../../uploads");

// 업로드 폴더가 존재하지 않으면 새로 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer 설정: 파일 저장 위치와 파일 이름을 정의
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 업로드된 파일을 저장할 경로 지정
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일명을 고유하게 만들기 위해 현재 시간과 랜덤 숫자를 추가
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // 원본 파일 확장자를 유지하면서 고유 파일명 생성
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer 미들웨어 설정
const upload = multer({
  storage: storage, // 파일 저장소 설정
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 파일 크기 5MB로 제한
  fileFilter: (req, file, cb) => {
    // 허용된 파일 형식을 정의
    const filetypes = /jpeg|jpg|png|gif|webp|bmp|tiff|ico/;
    const mimetype = filetypes.test(file.mimetype); // 파일의 MIME 타입 확인
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // 파일 확장자 확인

    // 파일 형식이 허용된 형식이면 업로드 허용
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      // 지원하지 않는 파일 형식일 경우 오류 반환
      cb(new Error("지원하지 않는 파일 형식입니다."));
    }
  },
});

// 업로드된 파일을 처리하고 썸네일을 생성하는 엔드포인트
router.post("/upload", upload.array("files", 20), async (req, res) => {
  try {
    console.log("업로드 통신이 안되나");
    // 업로드된 파일 정보 가져오기
    const files = req.files;
    const urls = []; // 결과를 저장할 배열

    for (const file of files) {
      // 업로드된 파일의 고유 이름 가져오기
      const filename = file.filename;

      // 원본 파일 경로와 썸네일 파일 경로 정의
      const originalFilePath = filename;
      const thumbnailFilePath = "thumb_" + filename;

      // Sharp 라이브러리를 사용하여 썸네일 생성
      await sharp(file.path)
        .resize(200, 200) // 썸네일 크기 설정 (200x200)
        .toFile(path.join(uploadDir, thumbnailFilePath)); // 썸네일 파일 저장

      console.log("오리리리리지지나나날 :: " + originalFilePath);
      console.log("떰떰네네네이이잉 :: " + thumbnailFilePath);
      // 원본 파일과 썸네일 파일의 URL을 배열에 추가
      urls.push({
        original: `http://localhost:4000/uploads/${originalFilePath}`,
        thumbnail: `http://localhost:4000/uploads/${thumbnailFilePath}`,
      });
    }

    // 클라이언트에 업로드된 파일의 URL을 포함한 JSON 응답 반환
    res.json({ urls });
  } catch (error) {
    // 오류 발생 시 콘솔에 오류 메시지 출력하고 500 상태 코드와 오류 메시지 반환
    console.error("Error processing files:", error);
    res.status(500).json({ error: "파일 처리 중 오류가 발생했습니다." });
  }
});

module.exports = router;
