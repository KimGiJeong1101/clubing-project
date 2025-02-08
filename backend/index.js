const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const jwt = require("jsonwebtoken"); // JWT 패키지 로드

const server = http.createServer(app);

// 미들웨어 설정
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    //클라이언트에서 서버로 요청을 보낼 때 쿠키와 인증 헤더를 포함할 수 있게 해주는 설정입니다.
    //이 옵션은 클라이언트와 서버 간의 인증된 세션 유지에 중요한 역할을 합니다.
  }),
);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // 소켓 통신을 허용할 출처
    methods: ["GET", "POST"], // 허용할 HTTP 메소드
  },
});

// body-parser 대신 아래 코드로 교체
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 쿠키 파서 미들웨어
app.use(cookieParser());

// 정적 파일 제공을 위해 uploads 폴더를 공개
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 정적파일 제공 (클럽용) - 구 추가 -
app.use("/clubs", express.static(path.join(__dirname, "clubs")));

// 정적파일 제공 (미팅용) - 구 추가 -
app.use("/meetings", express.static(path.join(__dirname, "meetings")));
// 정적파일 제공 (백그라운드 사진용) - 구 추가 -
app.use("/backgroundPic", express.static(path.join(__dirname, "backgroundPic")));

/////////////////////////////////////라우터 구간
//라우터 미들웨어(보드)
const boardsRouter = require("./src/routes/boards");
app.use("/clubs/boards", boardsRouter);

//라우터 미들웨어(채팅)
const chatroomsRouter = require("./src/routes/chatroom");
app.use("/clubs/chatrooms", chatroomsRouter);

//라우터 미들웨어(채팅이미지)
const chatimageRouter = require("./src/routes/chatimage");
app.use("/clubs/chatimage", chatimageRouter);

require("./src/routes/message")(io);

//라우터 미들웨어(갤러리)
const galleriesRouter = require("./src/routes/galleries");
app.use("/clubs/gallery", galleriesRouter);

//라우터 미들웨어(클럽)
const clubsRouter = require("./src/routes/clubs");
app.use("/clubs", clubsRouter);

//라우터 미들웨어(이벤트)
const eventRouter = require("./src/routes/events");
app.use("/events", eventRouter);

//라우터 미들웨어(미팅)
const meetingsRouter = require("./src/routes/meetings");
app.use("/meetings", meetingsRouter);

//라우터 미들웨어(댓글)
const repliesRouter = require("./src/routes/replies");
app.use("/replies", repliesRouter);

//라우터 미들웨어(댓글)
const BoardrepliesRouter = require("./src/routes/repliesBoard");
app.use("/replies/board", BoardrepliesRouter);

//라우터 미들웨어(유저)
const usersRouter = require("./src/routes/users");
app.use("/users", usersRouter);

//라우터 미들웨어(유저로그인)
const userSignsRouter = require("./src/routes/userSigns");
app.use("/userSigns", userSignsRouter);

const kakao = require("./src/routes/kakao");
app.use("/kakao", kakao);

/////////////////////////////////////라우터 구간 .end

// 루트 경로 접근 시 로그
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("몽고디비 연결 완료");

    server.listen(process.env.PORT, () => {
      console.log(`서버 시작 ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
};
startServer();
/////이 이후 하나씩 추가할 거 작성은 주석달아서 추가해놓고 말해주기!

// 'profile' 폴더를 정적 파일 경로로 설정
app.use("/profile", express.static(path.join(__dirname, "profile")));

////////////////////////////////////////////////////////////board////////////////////////////////////////////////////
// 파일 업로드를 위한 디렉토리 설정
const uploadDir = path.join(__dirname, "upload"); //d 추가
// 업로드된 파일 제공을 위한 정적 파일 미들웨어
app.use("/upload", express.static(uploadDir)); //d 추가