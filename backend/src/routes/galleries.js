const express = require("express");
const Club = require("../models/Club");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Gallery = require("../models/ClubGallery");
const moment = require("moment-timezone"); // moment-timezone 패키지를 사용하여 시간대 변환
const User = require("../models/User");
const auth = require("../middleware/auth");

// 날짜별 폴더 생성 함수 (갤러리용)
const createDailyFolder = () => {
  const today = moment().tz("Asia/Seoul").format("YYYY-MM-DD");
  const folderPath = path.join("uploads", today);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const originPath = path.join(folderPath, "origin_img");
  const thumbnailPath = path.join(folderPath, "thumbnail_img");

  if (!fs.existsSync(originPath)) {
    fs.mkdirSync(originPath);
  }

  if (!fs.existsSync(thumbnailPath)) {
    fs.mkdirSync(thumbnailPath);
  }

  return { originPath, thumbnailPath };
};

// 파일 이름이 중복될 경우 "(1)", "(2)" 숫자를 추가해 고유하게 만드는 함수
const generateUniqueFilename = (directory, filename) => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let uniqueFilename = filename;
  let counter = 1;

  while (fs.existsSync(path.join(directory, uniqueFilename))) {
    uniqueFilename = `${base}(${counter})${ext}`;
    counter++;
  }

  return uniqueFilename;
};

// Multer storage 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { originPath } = createDailyFolder();
    cb(null, originPath);
  },
  filename: function (req, file, cb) {
    const { originPath } = createDailyFolder();
    const uniqueFilename = generateUniqueFilename(originPath, file.originalname);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage }).array("files", 8);
// 클럽별 갤러리 이미지 등록
router.post("/:clubNumber/images", auth, upload, async (req, res) => {
  try {
    const { originPath, thumbnailPath } = createDailyFolder();
    const files = req.files;
    const { clubNumber } = req.params;
    const { writer, title, content } = req.body;

    const club = await Club.findById(clubNumber);
    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    // 1. 클럽 멤버 여부 및 관리자 권한 확인
    const isAdmin = club.admin === writer; // 관리자인지 여부 확인
    const isMember = club.members.includes(writer); // 클럽 멤버인지 여부 확인

    if (!isAdmin && !isMember) {
      // 클럽 관리자도 아니고 멤버도 아닌 경우
      return res.status(403).json({ error: "이 클럽의 멤버가 아니거나 권한이 없습니다." });
    }

    let originImages = [];
    let thumbnailImages = [];

    // 2. 이미지 처리
    for (const file of files) {
      const originalFilePath = path.join(originPath, file.filename);
      const thumbnailFilePath = path.join(thumbnailPath, `thumbnail_${file.filename}`);

      // 이미지 리사이징
      await sharp(file.path).resize(400).toFile(thumbnailFilePath);

      originImages.push(originalFilePath);
      thumbnailImages.push(thumbnailFilePath);
    }

    // 3. 갤러리 생성
    const gallery = new Gallery({
      clubNumber,
      writer,
      title,
      content,
      origin_images: originImages,
      thumbnail_images: thumbnailImages,
      likes: 0,
      views: 0,
      createdAt: moment().tz("Asia/Seoul").toDate(), // 한국 시간으로 저장
      updatedAt: moment().tz("Asia/Seoul").toDate(), // 한국 시간으로 저장
    });

    await gallery.save();
    return res.json({ success: true, gallery });
  } catch (error) {
    console.error("에러 발생:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 클럽별 이미지 수정 라우트
router.put("/:clubNumber/images/:id", auth, upload, async (req, res) => {
  try {
    const { clubNumber, id } = req.params;
    const { writer, title, content, sortedImages } = req.body;

    const gallery = await Gallery.findOne({ _id: id, clubNumber });
    const club = await Club.findById(clubNumber);

    if (!gallery || !club) {
      return res.status(404).json({ error: "클럽 또는 갤러리를 찾을 수 없습니다." });
    }

    if (gallery.writer !== writer && club.admin !== writer) {
      return res.status(403).json({ error: "수정할 권한이 없습니다." });
    }

    let newOriginImages = [];
    let newThumbnailImages = [];

    // sortedImages에서 기존 파일의 순서만 변경하고 이름은 유지
    if (sortedImages) {
      const parsedImages = JSON.parse(sortedImages);

      newOriginImages = parsedImages.map((img) => {
        const relativeUrl = img.url.replace("http://localhost:4000/", "");
        return relativeUrl.replace(/\//g, path.sep);
      });

      newThumbnailImages = parsedImages.map((img) => {
        const relativeUrl = img.url.replace("http://localhost:4000/", "");
        return relativeUrl
          .replace("origin_img", "thumbnail_img")
          .replace(/(\/|\\)([^/\\]+)$/, `$1thumbnail_$2`)
          .replace(/\//g, path.sep);
      });
    }

    // 새로 업로드된 파일 처리
    if (req.files && req.files.length > 0) {
      const { originPath, thumbnailPath } = createDailyFolder();

      for (const file of req.files) {
        const originalFilePath = path.join(originPath, file.filename);
        const thumbnailFilePath = path.join(thumbnailPath, `thumbnail_${file.filename}`);

        await sharp(file.path).resize(400).toFile(thumbnailFilePath);

        newOriginImages.push(originalFilePath);
        newThumbnailImages.push(thumbnailFilePath);
      }
    }

    // 갤러리 데이터 업데이트
    gallery.origin_images = newOriginImages;
    gallery.thumbnail_images = newThumbnailImages;
    gallery.title = title;
    gallery.content = content;
    gallery.updatedAt = moment().tz("Asia/Seoul").toDate(); // 한국 시간으로 저장

    await gallery.save();
    return res.json({ success: true, gallery });
  } catch (error) {
    console.error("에러 발생:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 클럽별 이미지 리스트 반환 라우트
router.get("/:clubNumber/images", async (req, res) => {
  try {
    const { clubNumber } = req.params;
    const galleries = await Gallery.find({ clubNumber });

    res.json(
      galleries.map((gallery) => ({
        _id: gallery._id,
        originalImage: `http://localhost:4000/${gallery.origin_images[0]}`,
        thumbnailImage: `http://localhost:4000/${gallery.thumbnail_images[0]}`,
        allImages: gallery.origin_images.map((img) => `http://localhost:4000/${img}`),
        title: gallery.title,
        content: gallery.content,
        writer: gallery.writer,
        createdAt: moment(gallery.createdAt).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"), // 한국 시간으로 변환
        updatedAt: moment(gallery.updatedAt).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"), // 한국 시간으로 변환
      })),
    );
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 클럽별 이미지 상세 정보 가져오기 라우트
router.get("/:clubNumber/images/:id", async (req, res) => {
  try {
    const { clubNumber } = req.params;
    const gallery = await Gallery.findOne({ _id: req.params.id, clubNumber });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }
    const email = gallery.writer;
    const UserNickName = await User.findOne({ email });

    res.json({
      _id: gallery._id,
      originImages: gallery.origin_images.map((img) => `http://localhost:4000/${img}`),
      title: gallery.title,
      content: gallery.content,
      views: gallery.views,
      likes: gallery.likes,
      writer: UserNickName.nickName,
      createdAt: moment(gallery.createdAt).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"), // 한국 시간으로 변환
      updatedAt: moment(gallery.updatedAt).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"), // 한국 시간으로 변환
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// 클럽별 이미지 삭제 라우트
router.delete("/:clubNumber/images", auth, async (req, res) => {
  const { imageIds, writer } = req.body;
  const { clubNumber } = req.params;
  console.log("권한 있는사람 : ", writer);

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return res.status(400).json({ error: "삭제할 이미지를 선택 후에 선택삭제를 눌러주세요" });
  }

  try {
    const galleriesToDelete = await Gallery.find({
      _id: { $in: imageIds },
      clubNumber,
    });

    if (galleriesToDelete.length === 0) {
      return res.status(404).json({ error: "Images not found." });
    }

    const club = await Club.findById(clubNumber);
    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    const isAdmin = club.admin === writer;

    for (const gallery of galleriesToDelete) {
      if (!isAdmin && gallery.writer !== writer) {
        return res.status(403).json({ error: "삭제 권한이 없습니다." });
      }
    }

    for (const gallery of galleriesToDelete) {
      for (const filePath of gallery.origin_images) {
        try {
          if (fs.existsSync(filePath)) {
            // 비동기 unlink 사용 및 에러 처리
            await fs.promises.unlink(filePath);
          }
        } catch (error) {}
      }

      for (const filePath of gallery.thumbnail_images) {
        try {
          if (fs.existsSync(filePath)) {
            // 비동기 unlink 사용 및 에러 처리
            await fs.promises.unlink(filePath);
          }
        } catch (error) {}
      }
    }

    await Gallery.deleteMany({ _id: { $in: imageIds }, clubNumber });

    return res.json({ success: true, deletedCount: galleriesToDelete.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 클럽별 전체 이미지 삭제 라우트
router.delete("/:clubNumber/images/all", auth, async (req, res) => {
  const { clubNumber } = req.params;
  const { writer } = req.body;
  console.log("권한 있는사람 : ", writer);

  try {
    const club = await Club.findById(clubNumber);

    if (!club) {
      return res.status(404).json({ error: "클럽을 찾을 수 없습니다." });
    }

    if (club.admin !== writer) {
      return res.status(403).json({ error: "전체 삭제는 클럽장만 사용할 수 있습니다." });
    }

    const galleries = await Gallery.find({ clubNumber });

    for (const gallery of galleries) {
      for (const filePath of gallery.origin_images) {
        try {
          if (fs.existsSync(filePath)) {
            // 비동기 unlink 사용 및 에러 처리
            await fs.promises.unlink(filePath);
          }
        } catch (error) {}
      }

      for (const filePath of gallery.thumbnail_images) {
        try {
          if (fs.existsSync(filePath)) {
            // 비동기 unlink 사용 및 에러 처리
            await fs.promises.unlink(filePath);
          }
        } catch (error) {}
      }
    }

    // 모든 갤러리 삭제
    await Gallery.deleteMany({ clubNumber });

    res.json({ success: true, deletedCount: galleries.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
