# Clubing — Backend

Express.js + MongoDB 기반 REST API 서버 및 Socket.io 실시간 서버입니다.

---

## 실행

```bash
npm install
npm start   # http://localhost:4000
```

---

## 프로젝트 구조

```
backend/src/
├── models/
│   ├── User.js           # 사용자 (이메일, 프로필, 관심사, 지역 등)
│   ├── Club.js           # 모임 (제목, 카테고리, 멤버, 위시리스트 등)
│   ├── ChattingRoom.js   # 채팅방 (clubId, 참가자 + 입장 시간)
│   ├── Message.js        # 채팅 메시지 (내용, 이미지, 타임스탬프)
│   ├── Meeting.js        # 정기모임 (일시, 장소, 비용, 참석자)
│   └── ...
├── routes/
│   ├── clubs.js          # 모임 CRUD, 멤버 관리, 추천
│   ├── chatroom.js       # 채팅방 생성/조회, 메시지 API
│   ├── meetings.js       # 정기모임 CRUD, 참석 처리
│   ├── users.js          # 회원 정보, 마이페이지
│   ├── gallery.js        # 사진첩 이미지 CRUD
│   └── board.js          # 게시판 글/투표 CRUD
└── middleware/
    └── auth.js           # JWT 검증 미들웨어
```

---

## 주요 API 엔드포인트

### 채팅 (`/clubs/chatrooms`)

| 메서드 | 경로                       | 설명                                    |
| ------ | -------------------------- | --------------------------------------- |
| `POST` | `/room`                    | 채팅방 생성 또는 참가자 추가            |
| `GET`  | `/room/:clubId`            | 채팅방 조회 (멤버 확인 포함)            |
| `GET`  | `/:clubId/messages`        | 메시지 조회 (skip 또는 before 커서)     |
| `GET`  | `/:clubId/messages/search` | 전체 메시지 검색 (limit 없음, ASC 반환) |
| `GET`  | `/:clubId/messages/around` | 특정 타임스탬프 전후 메시지 조회        |

### 모임 (`/clubs`)

| 메서드   | 경로                     | 설명                            |
| -------- | ------------------------ | ------------------------------- |
| `GET`    | `/`                      | 전체 모임 목록 (지역 필터 가능) |
| `GET`    | `/:category`             | 카테고리별 모임 목록            |
| `GET`    | `/scroll/:count`         | 무한 스크롤용 추가 모임 로드    |
| `GET`    | `/home/card`             | 홈 화면 모임 카드               |
| `GET`    | `/home/card/new`         | 신규 모임 목록                  |
| `GET`    | `/home/recommend`        | 관심사/지역 기반 추천 모임      |
| `POST`   | `/addMember/:clubId`     | 모임 가입                       |
| `POST`   | `/cencellMember/:clubId` | 모임 탈퇴                       |
| `DELETE` | `/delete/:clubId`        | 모임 삭제                       |

### 정기모임 (`/meetings`)

| 메서드 | 경로                  | 설명                  |
| ------ | --------------------- | --------------------- |
| `GET`  | `/`                   | 날짜별 정모 목록      |
| `GET`  | `/category/:category` | 카테고리별 정모 목록  |
| `GET`  | `/suggestForUser`     | 맞춤 추천 정모        |
| `POST` | `/join/:meetingId`    | 정모 참석 / 취소 토글 |

---

## 채팅 API 상세 — v2 개선

### 메시지 조회 `GET /:clubId/messages`

**쿼리 파라미터:**

| 파라미터 | 타입     | 설명                                                |
| -------- | -------- | --------------------------------------------------- |
| `skip`   | number   | 건너뛸 메시지 수 (일반 모드, 기본값 0)              |
| `limit`  | number   | 가져올 메시지 수 (기본값 30)                        |
| `before` | ISO 날짜 | 이 타임스탬프 이전 메시지만 조회 (around-mode 커서) |

`before`가 있으면 `skip`은 무시되고 타임스탬프 커서 방식으로 전환됩니다.

```js
// 일반 모드
GET /clubs/chatrooms/:clubId/messages?skip=30&limit=30

// around-mode (위로 스크롤 시)
GET /clubs/chatrooms/:clubId/messages?before=2024-01-15T10:00:00Z&limit=30
```

### 메시지 검색 `GET /:clubId/messages/search`

- `query` 파라미터 (2자 이상 필수)
- limit 없이 전체 검색
- 오래된 순(ASC)으로 반환 → 프론트에서 역순(DESC) 처리

### 주변 메시지 조회 `GET /:clubId/messages/around`

검색 결과 위치로 이동할 때 전후 메시지를 한 번에 로드합니다.

- `timestamp` 이전 메시지 **20건** (DESC → 역순 변환)
- `timestamp` 이후 메시지 **30건** (ASC)
- 합쳐서 최대 50건, 오래된 순으로 반환

```js
GET /clubs/chatrooms/:clubId/messages/around?timestamp=2024-01-15T10:00:00Z
```

---

## Socket.io 이벤트

| 이벤트           | 방향        | 설명               |
| ---------------- | ----------- | ------------------ |
| `joinRoom`       | 클라 → 서버 | 채팅방 입장        |
| `message` (emit) | 클라 → 서버 | 메시지 전송        |
| `message` (on)   | 서버 → 클라 | 실시간 메시지 수신 |
| `error`          | 서버 → 클라 | 에러 알림          |

---

## 인증

모든 API 엔드포인트는 `auth` 미들웨어를 통해 JWT 검증 후 `req.user`에 사용자 정보를 주입합니다.

```js
// 채팅 접근 권한: 모임 멤버 + 채팅방 참가자 동시 확인
const userId = req.user._id;
const participant = chattingRoom.participants.find((p) => p.userId.equals(userId));
if (!participant) return res.status(403).json({ message: "이 채팅방에 참가하지 않았습니다." });
```

### JWT 인증 흐름

```
1. 사용자가 이메일+비밀번호로 로그인
2. 서버가 JWT accessToken(짧은 유효기간) + refreshToken(긴 유효기간) 발급
3. 두 토큰을 HTTP-Only 쿠키로 브라우저에 저장
4. 이후 모든 API 요청마다 쿠키가 자동으로 전송 → 서버가 검증
5. accessToken이 만료되면 refreshToken으로 자동 재발급
6. refreshToken도 만료되면 로그인 페이지로 이동
```

> **왜 쿠키에 저장하나요?**  
> `localStorage`에 저장하면 JavaScript로 접근이 가능해 XSS 공격에 취약합니다. `HTTP-Only 쿠키`는 JavaScript에서 직접 접근할 수 없어 더 안전합니다.

- `backend/src/middleware/auth.js` — JWT 검증 미들웨어
- `frontend/src/utils/axios.js` — 토큰 만료 시 자동 갱신 인터셉터

---

## Socket.io 설정

Express 앱을 Node.js `http` 모듈로 감싸서 Socket.io와 연결합니다.

```js
// ❌ 잘못된 방법 — Express 객체에 직접 연결하면 소켓 작동 안 됨
const io = socketIo(app);

// ✅ 올바른 방법
const http = require("http");
const server = http.createServer(app); // Express를 HTTP 서버로 감싸기
const io = socketIo(server); // HTTP 서버에 소켓 연결
server.listen(process.env.PORT); // app.listen() 대신 server.listen()
```

**채팅 흐름**:

```
사용자 A가 메시지 입력
    → 클라이언트: socket.emit("message", { content: "안녕!" })
    → 서버: io.to(roomId).emit("message", ...) — 같은 방의 모든 사용자에게 전송
    → 사용자 B, C: 화면에 메시지 즉시 표시
    → 서버: MongoDB에 메시지 저장
```

- `backend/index.js` — http 서버 + Socket.io 초기화
- `backend/src/routes/chatroom.js` — 소켓 이벤트 핸들러

---

## 이미지 업로드 및 썸네일 생성

```
사용자가 이미지 선택
    → Multer: 서버에 파일 저장 (날짜별 폴더 분류)
    → Sharp: 이미지를 리사이징해 썸네일 생성
    → 원본 경로 + 썸네일 경로 모두 DB에 저장
    → 목록 화면: 썸네일 사용 (빠른 로딩)
    → 상세 화면: 원본 사용 (고화질)
```

| 라이브러리 | 역할                                           |
| ---------- | ---------------------------------------------- |
| **Multer** | 파일 업로드 미들웨어. 저장 폴더 및 파일명 설정 |
| **Sharp**  | 고성능 이미지 리사이징 및 포맷 변환            |
| **UUID**   | 업로드 파일명 중복 방지를 위한 고유 ID 생성    |

---

## 카카오 소셜 로그인 (OAuth 2.0)

```
1. 사용자: "카카오로 로그인" 버튼 클릭
2. 카카오 로그인 페이지로 이동
3. 사용자가 카카오 아이디/비밀번호 입력
4. 카카오 서버: 인증 코드(code) 발급 후 redirect_uri로 리다이렉트
5. 우리 서버: code로 카카오에 accessToken 요청
6. 카카오: accessToken 발급
7. 우리 서버: accessToken으로 사용자 정보 조회
8. 신규 사용자면 추가 정보 입력 페이지 → 가입 완료
9. 기존 사용자면 바로 JWT 발급 → 로그인
```

---

## 데이터베이스 설계

### 컬렉션(Collection) 관계

```
User (사용자)
  ├── clubs[]      → Club._id 참조 (가입한 모임)
  ├── wish[]       → Club._id 참조 (찜한 모임)
  └── invite[]     → Club._id 참조 (초대받은 모임)

Club (모임)
  ├── admin        → User.email 참조 (관리자)
  ├── members[]    → User.email 배열 (멤버 목록)
  ├── wishHeart[]  → User.email 배열 (찜한 사람)
  └── manager[]    → User.email 배열 (매니저)

ClubBoard (게시판)
  └── clubNumber   → Club._id 참조

Meeting (정기모임)
  ├── clubNumber   → Club._id 참조
  └── joinMember[] → User.email 배열

ChattingRoom (채팅방)
  └── clubId       → Club._id 참조 (1:1 매핑)

Message (메시지)
  ├── clubId       → ChattingRoom._id 참조
  └── sender       → User._id 참조
```

### Auto-Increment ID

MongoDB의 기본 ID(`ObjectId`)는 24자리 문자열이라 URL에 사용하기 불편합니다.  
`Counter` 컬렉션을 이용해 Club, Board, Meeting, Event에 **숫자 자동증가 ID**를 부여합니다.

```js
// backend/src/util/sequence.js
const getNextSequenceValue = async (sequenceName) => {
  const doc = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } }, // 1씩 증가
    { new: true, upsert: true }, // 없으면 생성
  );
  return doc.sequence_value;
};
```

---

## 트러블슈팅

### Socket.io 연결 안 됨

**상황**: `const io = socketIo(app)` 방식으로 연결하면 소켓이 정상 작동하지 않음.

**원인**: Socket.io는 Express 앱 객체가 아닌 **Node.js HTTP 서버 객체**와 연결해야 합니다. Express는 내부적으로 HTTP 서버를 만들어주지만 직접 접근이 안 됩니다.

**해결**: `http.createServer(app)`으로 HTTP 서버를 직접 생성 후 `server.listen()` 사용 → 실시간 채팅 정상 작동
