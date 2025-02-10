const express = require("express");
const User = require("../models/User");
const MyMessage = require("../models/MyMessage");
const RecentVisit = require("../models/RecentVisit");
const router = express.Router();
const jwt = require("jsonwebtoken");
//const sessionAuth = require('../middleware/sessionAuth');
const auth = require("../middleware/auth");
const async = require("async");
const { sendAuthEmail, verifyAuthCode } = require("../service/authController");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//sns
const passport = require("passport");

router.get("/auth", auth, async (req, res, next) => {
  try {
    const user = req.user; // 로그인된 사용자 정보
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "탈퇴한 회원입니다." });
    }

    return res.json({
      user,
    }); // 사용자 정보 반환
  } catch (error) {
    next(error); // 에러 처리
  }
});

// Email Check Route
router.post("/check-nickname", async (req, res) => {
  const { nickName } = req.body;
  try {
    // 이메일이 데이터베이스에 존재하는지 확인
    const user = await User.findOne({ nickName });

    if (user) {
      return res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
    }

    return res.status(200).json({ message: "사용 가능한 닉네임입니다." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 인증 이메일 보내기
router.post("/email-auth", sendAuthEmail);
// 인증 번호 확인
router.post("/verifyAuth", verifyAuthCode);

// 닉네임 Check Route
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    // 이메일이 데이터베이스에 존재하는지 확인
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    return res.status(200).json({ message: "사용 가능한 이메일입니다." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // 이메일 확인
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "이메일이 확인되지 않습니다." });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "탈퇴한 회원입니다." });
    }
    // 비밀번로가 올바른 것인지 체크
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(400).json({ error: "비밀번호가 틀렸습니다." });
    }
    const payload = {
      userId: user._id.toHexString(),
      // MongoDB의 ObjectId는 기본적으로 16진수로 된 고유 식별자입니다.
      // 이 식별자를 문자열로 변환해야 JWT의 페이로드에 저장할 수 있습니다.
    };
    console.log(payload);
    // token을 생성
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    //유저아이디 + 시크릿키 + 유효기간 15분 이란 뜻
    // 저 세 가지를 결합하는게 jwt.sign() 이놈

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // JWT를 쿠키에 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // 클라이언트 측에서 접근 불가 중요 췤크!!!!
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 쿠키 전송 (프로덕션 환경에서) 미친
      //maxAge: 5 * 60 * 1000, // 테스트 (5분)
      maxAge: 15 * 60 * 1000, // 쿠키 만료 시간 설정 (15분)
      sameSite: "Strict", //  CSRF 공격을 방지 미친
    });

    // 리프레시 토큰을 쿠키에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      //maxAge: 1 * 60 * 1000, // 테스트 (1분)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      sameSite: "Strict",
    });

    // 응답으로 사용자 정보와 성공 메시지 전송
    return res.json({ user, message: "로그인 성공" });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "리프레시 토큰이 없습니다." });
    }

    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 새로운 액세스 토큰 생성
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // 새로운 액세스 토큰을 쿠키에 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      //maxAge: 5 * 60 * 1000, // 테스트 (5분)
      maxAge: 15 * 60 * 1000, // 15분
      sameSite: "Strict",
    });

    return res.json({ message: "새로운 액세스 토큰이 발급되었습니다." });
  } catch (error) {
    // 리프레시 토큰이 유효하지 않을 때
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "리프레시 토큰이 유효하지 않습니다." });
    }
    next(error);
  }
});

//8.22 쿠키랑 jwt 삭제
router.post("/logout", (req, res, next) => {
  try {
    // 클라이언트 측에서 쿠키 삭제
    res.clearCookie("accessToken", {
      httpOnly: true, // 클라이언트 측에서 접근 불가
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 쿠키 전송 (프로덕션 환경에서)
      sameSite: "Strict", // CSRF 공격 방지
    });

    res.clearCookie("refreshToken", {
      httpOnly: true, // 클라이언트 측에서 접근 불가
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 쿠키 전송 (프로덕션 환경에서)
      sameSite: "Strict", // CSRF 공격 방지
    });

    // 로그 출력
    console.log("AccessToken 쿠키 삭제:", req.cookies.accessToken); // null이어야 함
    console.log("RefreshToken 쿠키 삭제:", req.cookies.refreshToken); // null이어야 함

    // 로그아웃 성공 응답
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// 클럽 ID 배열의 길이를 반환
const getMyGroupsCount = async (clubIds) => {
  return clubIds.length; // clubIds 배열의 길이를 반환
};

// src/routes/users.js
router.get("/myPage", auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 프로필 이미지 경로를 웹 URL로 변환
    if (user.profilePic && user.profilePic.originalImage && user.profilePic.thumbnailImage) {
      // 프로필 이미지 URL이 `https://via.placeholder.com/600x400?text=no+user+image`가 아니면 변환
      if (!user.profilePic.originalImage.startsWith("https://via.placeholder.com")) {
        user.profilePic.originalImage = `${user.profilePic.originalImage.replace(/\\/g, "/")}`;
      }

      if (!user.profilePic.thumbnailImage.startsWith("https://via.placeholder.com")) {
        user.profilePic.thumbnailImage = `${user.profilePic.thumbnailImage.replace(/\\/g, "/")}`;
      }
    }
    const myGroupsCount = await getMyGroupsCount(user.clubs); // 사용자의 '내 모임' 클럽 개수
    const wishGroupsCount = await getMyGroupsCount(user.wish); // 사용자의 '내 모임' 클럽 개수
    const inviteGroupsCount = await getMyGroupsCount(user.invite); // 사용자의 '초대' 클럽 개수

    return res.json({
      user,
      counts: {
        myGroups: myGroupsCount,
        wishGroups: wishGroupsCount,
        inviteGroups: inviteGroupsCount,
      },
    }); // user 객체를 그대로 반환
  } catch (error) {
    next(error);
  }
});

// 마이페이지에서 수정
router.put("/myPage/update", auth, async (req, res, next) => {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const updateData = req.body;

    // 비밀번호를 업데이트할 때는 user.save()를 사용해야 합니다.
    // 사용자의 기존 정보를 로드한 후, 새로운 정보를 적용하고 저장합니다.
    const updatedUser = await User.findById(user._id);
    Object.assign(updatedUser, updateData);
    await updatedUser.save();

    // 업데이트된 사용자 정보 반환
    return res.json(updatedUser);
  } catch (error) {
    // 에러가 발생했을 경우 처리
    next(error);
  }
});
//////////////////// 회원 탈퇴
// 회원 탈퇴 API
router.put("/myPage/delete", auth, async (req, res, next) => {
  try {
    const userId = req.user._id; // 현재 로그인한 사용자의 ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // isActive 필드를 false로 설정하여 탈퇴 처리
    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "탈퇴가 완료되었습니다." });
  } catch (error) {
    next(error);
  }
});

////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정////////////////////////////////////////////////// 이미지 수정

//폴더 생성
const createDailyFolder = () => {
  const today = new Date(); // 현재 날짜와 시간을 가져옵니다.
  const year = today.getFullYear(); // 현재 연도를 가져옵니다.
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 현재 월을 2자리 문자열로 변환합니다.
  const day = String(today.getDate()).padStart(2, "0"); // 현재 일을 2자리 문자열로 변환합니다.

  // 'profile/년-월-일' 형식의 폴더 경로를 생성합니다.
  const folderPath = path.join("profile", `${year}-${month}-${day}`);

  // 폴더가 존재하지 않으면 생성합니다.
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // 중간 폴더가 없어도 모두 생성합니다.
  }

  // 'origin_img' 폴더 경로를 생성합니다.
  const originPath = path.join(folderPath, "origin_img");
  // 'thumbnail_img' 폴더 경로를 생성합니다.
  const thumbnailPath = path.join(folderPath, "thumbnail_img");

  // 'origin_img' 폴더가 존재하지 않으면 생성합니다.
  if (!fs.existsSync(originPath)) {
    fs.mkdirSync(originPath);
  }

  // 'thumbnail_img' 폴더가 존재하지 않으면 생성합니다.
  if (!fs.existsSync(thumbnailPath)) {
    fs.mkdirSync(thumbnailPath);
  }

  // 'origin_img'와 'thumbnail_img' 폴더 경로를 반환합니다.
  return { originPath, thumbnailPath };
};

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { originPath } = createDailyFolder();
    cb(null, originPath); // 올바른 폴더 경로에 저장
  },
  filename: function (req, file, cb) {
    // 파일 이름 설정
    cb(null, `${Date.now()}_${file.originalname}`); // 파일 이름 설정
  },
});

const upload = multer({ storage: storage });

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000";

router.put("/profile/image", auth, upload.single("image"), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    // 업로드된 파일의 경로
    const originalFilePath = req.file.path;
    console.log("원본 파일 경로:", originalFilePath);
    const originalFileName = req.file.filename;

    // 섬네일 파일 경로 설정
    const { thumbnailPath } = createDailyFolder(); // 기존 폴더 생성 로직 재사용
    const thumbnailFilePath = path.join(thumbnailPath, `thumbnail_${originalFileName}`);

    // 섬네일 생성
    await sharp(originalFilePath)
      .resize(400) // 섬네일 크기 조정
      .toFile(thumbnailFilePath);

    // 절대 URL로 변환
    user.profilePic.originalImage = `${baseURL}/${originalFilePath.replace(/\\/g, "/")}`;
    user.profilePic.thumbnailImage = `${baseURL}/${thumbnailFilePath.replace(/\\/g, "/")}`;

    await user.save();

    // 기존 이미지 및 섬네일 삭제
    const oldImagePath = path.join(__dirname, "..", user.profilePic.originalImage.replace(`${baseURL}/`, ""));
    const oldThumbnailPath = path.join(__dirname, "..", user.profilePic.thumbnailImage.replace(`${baseURL}/`, ""));

    console.log("기존 이미지 삭제 확인:", oldImagePath);
    if (fs.existsSync(oldImagePath) && oldImagePath !== originalFilePath) {
      fs.unlinkSync(oldImagePath); // 이전 이미지 삭제
      console.log("이전 이미지 삭제 완료");
    } else {
      console.log("이전 이미지 파일이 존재하지 않거나 현재 이미지와 동일함");
    }

    console.log("기존 섬네일 삭제 확인:", oldThumbnailPath);
    if (fs.existsSync(oldThumbnailPath) && oldThumbnailPath !== thumbnailFilePath) {
      fs.unlinkSync(oldThumbnailPath); // 이전 섬네일 삭제
      console.log("이전 섬네일 삭제 완료");
    } else {
      console.log("이전 섬네일 파일이 존재하지 않거나 현재 섬네일과 동일함");
    }

    res.json({ success: true, message: "프로필 이미지가 수정되었습니다." });
  } catch (error) {
    console.error("프로필 이미지 수정 중 오류가 발생했습니다:", error);
    res.status(500).json({ success: false, message: "프로필 이미지 수정 중 오류가 발생했습니다.", error });
  }
});

// 프로필 이미지 삭제 라우트
router.delete("/profile/image_del", auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    // 기본 이미지 URL로 설정
    user.profilePic.originalImage = "https://via.placeholder.com/600x400?text=no+user+image";
    user.profilePic.thumbnailImage = "https://via.placeholder.com/600x400?text=no+user+image";

    await user.save(); // 사용자 정보 저장

    res.json({ success: true, message: "이미지가 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ success: false, message: "이미지 삭제 중 오류가 발생했습니다.", error });
  }
});
////////////////////////////////////////////////// 이미지 삭제 ////////////////////////////////////////////////// 이미지 삭제////////////////////////////////////////////////// 이미지 삭제

// 전화번호로 이메일 조회
router.post("/findEmail", async (req, res) => {
  const { phone } = req.body;
  try {
    // 전화번호로 사용자 검색
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "해당 전화번호로 등록된 이메일이 없습니다." });
    }

    // 이메일 반환
    return res.status(200).json({ email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

///로그인 창에서 이메잉로 인증 후 비번 변경
router.post("/validate-email", async (req, res) => {
  const { email } = req.body;
  try {
    // 이메일이 데이터베이스에 존재하는지 확인
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "이메일이 존재하지 않습니다." });
    }
    res.status(200).json({ message: "인증 메일이 발송되었습니다." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 이메일로 인증 받은 후 비밀번호 변경
router.post("/change-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 필수 데이터 확인
    if (!email || !newPassword) {
      return res.status(400).json({ ok: false, msg: "필요한 데이터가 누락되었습니다." });
    }

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, msg: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 업데이트
    user.password = newPassword;
    await user.save();

    return res.json({ ok: true, msg: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ ok: false, msg: "서버 오류가 발생했습니다." });
  }
});

router.put("/introduction", auth, async (req, res, next) => {
  try {
    const { introduction } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    user.profilePic.introduction = introduction;

    await user.save();

    return res.json({ ok: true, msg: "성공적으로 변경되었습니다." });
  } catch (error) {
    next(error);
  }
});

// 특정 ID를 가진 사용자의 정보를 가져오는 라우트 핸들러 (채팅 메세지 리스트)
router.get("/:id", async (req, res) => {
  try {
    // 요청 URL에서 사용자 ID를 추출하고, 데이터베이스에서 해당 ID로 사용자 검색
    const user = await User.findById(req.params.id);

    // 사용자가 존재하지 않는 경우, 404 상태 코드와 함께 오류 메시지 반환
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    // 사용자가 존재하는 경우, 사용자 이름만 포함된 JSON 응답 반환

    res.json({ _id: user._id, name: user.name, profilePic: user.profilePic.thumbnailImage, nickName: user.nickName });
  } catch (error) {
    // 예외 발생 시, 콘솔에 오류 로그 출력 및 500 상태 코드와 함께 오류 메시지 반환
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});


// 특정 이메일을 가진 사용자의 정보를 가져오는 라우트 핸들러
router.get("/email/:email", async (req, res) => {
  try {
    // 요청 URL에서 사용자 이메일을 추출하고, 데이터베이스에서 해당 이메일로 사용자 검색
    const user = await User.findOne({ email: req.params.email });

    // 사용자가 존재하지 않는 경우, 404 상태 코드와 함께 오류 메시지 반환
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 사용자가 존재하는 경우, 사용자 정보를 포함한 JSON 응답 반환
    res.json({ _id: user._id, name: user.name, profilePic: user.profilePic.thumbnailImage, nickName: user.nickName });
  } catch (error) {
    // 예외 발생 시, 콘솔에 오류 로그 출력 및 500 상태 코드와 함께 오류 메시지 반환
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});


router.post("/update-location", async (req, res) => {
  try {
    const { homeLocation, workplace, interestLocation } = req.body;
    const { email } = req.body; // 인증된 사용자의 이메일을 가져옵니다.

    // 필수 데이터 확인
    if (!email) {
      return res.status(400).json({ ok: false, msg: "이메일이 누락되었습니다." });
    }

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, msg: "사용자를 찾을 수 없습니다." });
    }

    // 위치 정보가 요청된 경우에만 업데이트
    if (homeLocation && (homeLocation.city || homeLocation.district || homeLocation.neighborhood)) {
      user.homeLocation = homeLocation;
    }
    if (workplace && (workplace.city || workplace.district || workplace.neighborhood)) {
      user.workplace = workplace;
    }
    if (interestLocation && (interestLocation.city || interestLocation.district || interestLocation.neighborhood)) {
      user.interestLocation = interestLocation;
    }

    await user.save();

    return res.json({ ok: true, msg: "위치 정보가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ ok: false, msg: "서버 오류가 발생했습니다." });
  }
});

// 초대 거절 라우트
router.post("/reject-invite", auth, async (req, res) => {
  try {
    const user = req.user;
    const { clubId } = req.body; // 클럽 ID를 요청 본문에서 받음

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    if (!clubId) {
      return res.status(400).json({ success: false, message: "클럽 ID가 제공되지 않았습니다." });
    }
    // 초대 목록에서 clubId를 제거
    user.invite = user.invite.filter((id) => id !== clubId);
    await user.save(); // 사용자 정보 저장

    res.json({ success: true, message: "초대를 거절했습니다." });
  } catch (error) {
    res.status(500).json({ success: false, message: "초대를 거절 중 오류가 발생했습니다.", error });
  }
});

// 유저 ID로 메시지 조회
router.get("/messages/:email", async (req, res) => {
  try {
    const messages = await MyMessage.find({ recipient: req.params.email }).sort({ date: -1 }); // 내림차순으로 정렬 (가장 최근 메시지 먼저)
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message }); // 수정된 부분
  }
});

// Express 서버 측 라우트 예시
router.get("/messages/counts/:email", async (req, res) => {
  try {
    const readCount = await MyMessage.countDocuments({ recipient: req.params.email, isRead: true });
    const unreadCount = await MyMessage.countDocuments({ recipient: req.params.email, isRead: false });

    res.status(200).json({
      readCount,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 유저 ID로 읽지 않은 메시지 조회
router.get("/messages/:email/false", async (req, res) => {
  try {
    const messages = await MyMessage.find({
      recipient: req.params.email,
      isRead: false,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 유저 ID로 읽지 읽은 메시지 조회
router.get("/messages/:email/true", async (req, res) => {
  try {
    const messages = await MyMessage.find({
      recipient: req.params.email,
      isRead: true,
    }).sort({ date: -1 }); // 내림차순으로 정렬 (가장 최근 메시지 먼저)
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // 메시지 읽음 상태로 변경
router.put("/messages/changestate", async (req, res) => {
  try {
    let { ids } = req.body; // 클라이언트에서 전송한 메시지 IDs 배열 또는 단일 ID
    console.log("받은 IDs:", ids);

    // IDs가 이중 배열일 경우 평탄화
    if (Array.isArray(ids[0])) {
      ids = ids.flat();
    }

    // IDs가 배열인지 확인하고, 단일 값일 경우 배열로 변환
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    // 문자열 IDs를 그대로 사용하여 업데이트
    const result = await MyMessage.updateMany(
      { _id: { $in: ids } }, // IDs 배열에 포함된 메시지를 찾기 위한 조건
      { $set: { isRead: true } }, // 업데이트할 내용
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "No messages found" });
    }

    return res.status(200).json({ message: "Messages updated successfully" });
  } catch (error) {
    console.error("Error updating message state:", error); // 서버 로그로 오류 확인
    res.status(500).json({ error: error.message });
  }
});

// 메시지 삭제
router.post("/messages/delete", async (req, res) => {
  try {
    const { ids, email } = req.body;

    // IDs 배열이 제공되지 않았거나 비어있는 경우 오류 반환
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid message IDs" });
    }

    // IDs가 올바른 형식인지 확인 (MongoDB ObjectId 형식 체크)
    if (!ids.every((id) => typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/))) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // 여러 메시지 삭제
    const result = await MyMessage.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No messages found to delete" });
    }

    // 삭제 후 안 읽음 메시지 재조회
    const updatedMessages = await MyMessage.find({
      recipient: email,
      isRead: false,
    });

    res.status(200).json({ message: "Messages deleted successfully", messages: updatedMessages });
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//메시지 보내기
router.post("/messages", async (req, res) => {
  console.log("Received request body:", req.body); // 요청 본문 로그 출력

  const { club, recipient, sender, content, title } = req.body;

  try {
    const newMessage = new MyMessage({
      club,
      recipient,
      sender,
      content,
      title,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "메시지 저장에 실패했습니다." });
  }
});

// 유저 ID로 방문 클럽 조회
router.get("/recentvisit/:email", async (req, res) => {
  const email = req.params.email;
  console.log("받아온 이메일:", email);
  try {
    // 해당 이메일로 RecentVisit 항목 조회
    const RecentVisitList = await RecentVisit.find({ email: email }).sort({ date: -1 }); // 내림차순으로 정렬 (가장 최근 메시지 먼저)

    // 각 RecentVisit 항목에 클럽 수를 추가
    const responseData = RecentVisitList.map((item) => ({
      ...item.toObject(), // Mongoose 문서를 일반 객체로 변환
      clubCount: item.clubs.flat().filter((club) => typeof club === "number").length, // 중첩 배열 평탄화 후 숫자만 필터링하여 카운트
    }));
    // responseData를 콘솔에 찍기
    console.log("왜 안되는데:", responseData);

    // 데이터와 총 항목 수를 객체로 반환
    res.status(200).json({
      RecentVisitList: responseData, // 조회된 데이터
    });
  } catch (error) {
    res.status(500).json({ error: error.message }); // 에러 처리
  }
});

//최근 본 모임 저장
router.post("/recentvisit", async (req, res) => {
  let { clubs, email } = req.body;

  // clubs가 배열인지 확인하고, 배열이 아닐 경우 단일 값을 배열로 변환
  if (!Array.isArray(clubs)) {
    clubs = [clubs];
  }

  try {
    // 이메일로 RecentVisit 문서 찾기
    let recentVisit = await RecentVisit.findOne({ email });

    // 클라이언트에서 보내온 clubs 값을 문자열 배열로 변환
    const incomingClubs = clubs.map((club) => Number(club));

    if (recentVisit) {
      // 기존 clubs 값을 문자열 배열로 변환
      const existingClubs = recentVisit.clubs.map((club) => Number(club));

      // 중복 제거 및 추가
      const updatedClubs = [...new Set([...existingClubs, ...incomingClubs])];

      // 최대 6개 제한: 6개 초과 시 가장 오래된 기록 제거
      if (updatedClubs.length > 6) {
        updatedClubs.sort((a, b) => b - a); // 클럽 ID가 큰 것이 최신
        updatedClubs.splice(6); // 가장 오래된 기록 제거
      }

      console.log("Updated clubs:", updatedClubs); // 업데이트된 clubs 배열 로그 출력

      recentVisit.clubs = updatedClubs;
      recentVisit.date = Date.now();
      await recentVisit.save(); // 문서 업데이트
    } else {
      // 문서가 존재하지 않으면 새로운 문서 생성
      recentVisit = new RecentVisit({
        clubs: incomingClubs,
        email,
      });
      await recentVisit.save(); // 문서 저장
    }

    res.status(201).json(recentVisit); // 응답 반환
  } catch (err) {
    console.error(err); // 오류 로그 출력
    res.status(500).json({ message: "목록 저장에 실패했습니다." }); // 오류 응답
  }
});

module.exports = router; // 올바르게 내보내기
