# Clubing (클러빙)

> MERN 스택으로 만든 소모임 플랫폼 웹사이트

---

## 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [개발 배경 및 목표](#개발-배경-및-목표)
3. [기술 스택](#기술-스택)
4. [기술 선정 이유](#기술-선정-이유)
5. [주요 기능](#주요-기능)
6. [프로젝트 구조](#프로젝트-구조)
7. [시작하기 (로컬 실행 방법)](#시작하기-로컬-실행-방법)
8. [환경 변수 설정](#환경-변수-설정)
9. [API 구조 요약](#api-구조-요약)
10. [개발 과정 및 트러블슈팅](#개발-과정-및-트러블슈팅)

---

## 프로젝트 소개

**Clubing(클러빙)** 은 관심사가 비슷한 사람들이 모여 소모임을 만들고 활동할 수 있는 커뮤니티 플랫폼입니다.

- 원하는 모임을 **카테고리·지역별**로 검색하고 가입할 수 있습니다.
- 모임 안에서 **게시판, 갤러리, 채팅**으로 소통할 수 있습니다.
- **정기모임 일정**을 등록하고 참석 신청을 할 수 있습니다.
- 로그인 사용자의 관심사·지역에 맞는 **맞춤 모임을 추천**해 줍니다.

> **MERN 스택**이란?
> **M**ongoDB (데이터베이스) + **E**xpress (서버 프레임워크) + **R**eact (프론트엔드) + **N**ode.js (서버 런타임)
> 네 가지 기술을 조합해 프론트엔드부터 백엔드, DB까지 **JavaScript 하나**로 구성하는 풀스택 아키텍처입니다.

---

## 개발 배경 및 목표

### 왜 만들었나요?

- 코로나19 이후 비대면·온라인 활동이 증가하며 **온라인 소모임 플랫폼**의 필요성이 높아졌습니다.
- 대규모 SNS보다는 **관심사가 같은 소규모 커뮤니티**에서 더 큰 연결감을 느끼는 사람이 많아졌습니다.
- 도시화로 인한 **사회적 고립감**을 온라인 모임으로 완화할 수 있습니다.
- 바쁜 현대인들이 **시간·장소에 구애받지 않고** 쉽게 모일 수 있는 공간이 필요했습니다.

### 개발 목표

사용자 맞춤 커뮤니티와 비대면 소통 기회를 제공하고, 사용자 친화적인 소모임 플랫폼을 개발하는 것이 목표입니다.

---

## 기술 스택

### Frontend (화면 담당)

| 기술 | 역할 |
|------|------|
| React 18 | UI 컴포넌트 기반 프론트엔드 프레임워크 |
| Redux Toolkit | 전역 상태 관리 (로그인 정보, 채팅 등) |
| React Query | 서버 API 데이터 캐싱 및 비동기 처리 |
| Material-UI (MUI) | UI 컴포넌트 라이브러리 |
| React Router | 페이지 라우팅 (URL 관리) |
| Axios | HTTP API 통신 |
| Socket.io-client | 실시간 채팅 (WebSocket) |
| Framer Motion | 애니메이션 효과 |
| CKEditor 5 | 게시판 글쓰기 에디터 |
| TUI Image Editor | 갤러리 이미지 편집 |
| Cropper.js | 프로필 이미지 크롭 |

### Backend (서버 담당)

| 기술 | 역할 |
|------|------|
| Node.js | 서버 런타임 환경 |
| Express.js | HTTP 서버 및 REST API 라우팅 |
| Socket.io | 실시간 양방향 채팅 |
| MongoDB | NoSQL 데이터베이스 |
| Mongoose | MongoDB 스키마 모델링 (ODM) |
| JWT (jsonwebtoken) | 로그인 인증 토큰 발급 및 검증 |
| bcryptjs | 비밀번호 해싱 (암호화) |
| Multer | 파일(이미지) 업로드 처리 |
| Sharp | 이미지 리사이징 및 썸네일 생성 |
| Nodemailer | 이메일 인증 코드 발송 |

### DevOps & 협업 도구

| 도구 | 역할 |
|------|------|
| GitHub Actions | CI/CD 자동화 (Prettier 코드 포맷팅) |
| Prettier | 코드 스타일 통일 |
| GitHub / Git | 버전 관리 및 협업 |
| Slack / Jira | 팀 소통 및 일정 관리 |

---

## 기술 선정 이유

### React
컴포넌트 단위로 UI를 분리해 코드 재사용성이 높고, 상태 관리 라이브러리와의 결합이 자유로워 복잡한 UI를 효율적으로 구성할 수 있습니다.

### Redux Toolkit
로그인 사용자 정보, 채팅 상태, 찜 목록 등 여러 페이지에서 공유해야 하는 데이터를 한 곳에서 관리합니다. `redux-persist`와 함께 사용해 새로고침 후에도 상태가 유지됩니다.

### React Query
서버에서 받아온 데이터(클럽 목록, 미팅 정보 등)의 캐싱과 자동 갱신을 담당합니다. API 호출 중복을 줄이고 로딩/에러 상태를 쉽게 처리할 수 있습니다.

### Express.js
가볍고 유연한 Node.js 서버 프레임워크입니다. 미들웨어 기반 구조 덕분에 인증, 파일 업로드, 에러 처리를 모듈화해 추가하기 쉽습니다.

### MongoDB
유연한 스키마 구조(NoSQL)로 사용자 관심사, 클럽 정보 등 다양한 형태의 데이터를 자유롭게 저장합니다. `Mongoose`를 통해 스키마를 정의하고 유효성 검사를 처리합니다.

### Socket.io
HTTP 요청-응답 방식으로는 구현하기 어려운 **실시간 양방향 통신**을 가능하게 합니다. 클럽 채팅방에서 메시지를 보내면 방 안의 모든 사용자에게 즉시 전달됩니다.

### JWT (JSON Web Token)
사용자가 로그인하면 서버가 토큰을 발급하고, 이후 요청마다 토큰을 검사해 인증합니다. `accessToken`(단기)과 `refreshToken`(장기)을 쿠키로 관리해 보안성을 높였습니다.

---

## 주요 기능

### 회원 관리
- **이메일 회원가입** — 이메일 인증 코드 발송 후 가입
- **카카오 소셜 로그인** — OAuth 2.0 기반 간편 로그인
- **JWT 인증** — 액세스 토큰 + 리프레시 토큰으로 로그인 상태 유지
- **프로필 설정** — 프로필 사진(크롭), 닉네임, 관심사, 지역, 직업 설정

### 모임 (Club)
- **모임 생성/수정/삭제** — 카테고리, 지역, 대표 이미지, 모임 소개 등록
- **모임 검색** — 카테고리별·지역별 필터링, 이름으로 검색
- **모임 가입/탈퇴** — 멤버 관리, 관리자/매니저 권한 부여
- **찜하기** — 관심 모임 저장 및 목록 확인
- **맞춤 추천** — 로그인 사용자의 관심사·지역 기반 모임 추천

### 게시판 (Board)
- CKEditor 5 기반 **리치 텍스트 글쓰기**
- 게시글 CRUD (작성/조회/수정/삭제)
- **투표 기능** — 단일/복수 선택 투표 생성, 익명 투표 지원

### 갤러리 (Gallery)
- 이미지 업로드 및 TUI Image Editor로 **편집 후 저장**
- 원본 이미지 + 썸네일 자동 생성 (Sharp)
- 갤러리 CRUD 및 **댓글 기능**

### 실시간 채팅 (Chat)
- Socket.io 기반 **실시간 메시지 전송**
- 채팅 내 **이미지 전송** 지원
- 메시지 MongoDB 저장 (채팅 기록 유지)
- 클럽 멤버만 채팅방 접근 가능

### 정기모임 (Meeting)
- 모임 일정 등록 (날짜, 장소, 비용, 정원)
- **참석 신청/취소**
- 날짜별·카테고리별 정기모임 목록 조회
- 사용자 관심사 기반 모임 추천

### 이벤트 (Event)
- 플랫폼 이벤트 게시글 CRUD
- 이벤트 이미지 업로드

### 마이페이지
- 내가 가입한 모임, 찜 목록, 초대 목록 관리
- 프로필 수정 (사진, 관심사, 지역, 직업)
- 개인 메시지함 (MyMessage)
- 최근 방문 모임 기록
- 회원 탈퇴

---

## 프로젝트 구조

```
clubing-project/
├── .github/
│   └── workflows/
│       └── prettier.yml       # GitHub Actions CI/CD 설정
├── .prettierrc                 # Prettier 코드 포맷 규칙
├── backend/                    # 서버 (Node.js + Express)
│   ├── index.js                # 서버 진입점 (앱 설정, DB 연결, 소켓 초기화)
│   └── src/
│       ├── middleware/
│       │   └── auth.js         # JWT 인증 미들웨어
│       ├── models/             # MongoDB 스키마 (Mongoose)
│       │   ├── User.js
│       │   ├── Club.js
│       │   ├── ClubBoard.js
│       │   ├── ClubGallery.js
│       │   ├── Meeting.js
│       │   ├── ChattingRoom.js
│       │   ├── Message.js
│       │   ├── Reply.js
│       │   ├── Event.js
│       │   └── ...
│       ├── routes/             # API 라우터 (엔드포인트 정의)
│       │   ├── clubs.js        # 모임 CRUD, 추천, 찜
│       │   ├── boards.js       # 게시판 CRUD, 투표
│       │   ├── galleries.js    # 갤러리 CRUD
│       │   ├── meetings.js     # 정기모임 CRUD, 참석
│       │   ├── chatroom.js     # 채팅방 생성/조회
│       │   ├── message.js      # Socket.io 실시간 채팅
│       │   ├── users.js        # 유저 프로필 조회/수정
│       │   ├── userSigns.js    # 회원가입/로그인/토큰
│       │   ├── kakao.js        # 카카오 OAuth
│       │   ├── replies.js      # 갤러리 댓글
│       │   ├── repliesBoard.js # 게시판 댓글
│       │   └── events.js       # 이벤트 CRUD
│       ├── service/            # 비즈니스 로직 분리
│       │   ├── emailSend.js    # 이메일 발송 (Nodemailer)
│       │   └── emailAuth.js    # 이메일 인증 코드 관리
│       └── util/
│           └── sequence.js     # MongoDB 자동증가 ID 생성
└── frontend/                   # 클라이언트 (React)
    └── src/
        ├── App.jsx             # 라우팅 설정
        ├── utils/
        │   └── axios.js        # Axios 인스턴스 (인터셉터, 토큰 갱신)
        ├── store/              # Redux 상태 관리
        │   ├── index.js        # Redux 스토어 설정
        │   ├── actions/        # 비동기 액션 (thunk)
        │   └── reducers/       # 슬라이스 (상태 정의)
        ├── hooks/
        │   └── usePost.js      # 게시글 관련 커스텀 훅
        ├── layout/             # 공통 레이아웃
        │   ├── Header.jsx
        │   ├── NavBar.jsx
        │   └── Footer.jsx
        ├── components/         # 재사용 가능한 UI 컴포넌트
        │   ├── auth/           # 인증 관련 컴포넌트
        │   ├── club/           # 모임 관련 컴포넌트
        │   └── common/         # 공통 컴포넌트
        └── pages/              # 페이지 단위 컴포넌트
            ├── LandingPage/    # 랜딩 페이지
            ├── auth/           # 로그인, 회원가입
            ├── home/           # 홈 화면
            ├── club/           # 모임 목록/상세/생성
            ├── chat/           # 채팅
            ├── event/          # 이벤트
            ├── myPage/         # 마이페이지
            └── recommend/      # 추천 모임
```

---

## 시작하기 (로컬 실행 방법)

### 사전 준비

- [Node.js](https://nodejs.org) 18 이상
- [MongoDB](https://www.mongodb.com) (로컬 설치 또는 MongoDB Atlas 클라우드 사용)
- npm 또는 yarn

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/clubing-project.git
cd clubing-project
```

### 2. 백엔드 실행

```bash
cd backend
npm install
# .env 파일 생성 후 환경 변수 입력 (아래 환경 변수 섹션 참고)
npm run dev    # nodemon으로 개발 서버 실행
```

백엔드 서버: `http://localhost:4000`

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm start
```

프론트엔드: `http://localhost:3000`

---

## 환경 변수 설정

백엔드 폴더(`backend/`)에 `.env` 파일을 생성하고 아래 값을 설정합니다.

```env
# 서버 포트
PORT=4000

# MongoDB 연결 문자열
# 로컬 MongoDB 예시
MONGO_URI=mongodb://localhost:27017/clubing
# MongoDB Atlas(클라우드) 예시
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/clubing

# JWT 비밀키 (아무 문자열이나 길고 복잡하게 설정)
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# 이메일 인증용 네이버 SMTP 설정
EMAIL_USER=your_naver_email@naver.com
EMAIL_PASS=your_naver_app_password

# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://localhost:4000/kakao/callback
```

프론트엔드 폴더(`frontend/`)에 `.env` 파일을 생성합니다.

```env
REACT_APP_API_URL=http://localhost:4000
```

---

## API 구조 요약

> REST API 설계 원칙에 따라 URL은 **리소스(명사)** 로, HTTP 메서드는 **행동(동사)** 으로 표현합니다.

| 메서드 | URL 예시 | 설명 |
|--------|----------|------|
| GET | `/clubs` | 모임 목록 조회 |
| POST | `/clubs/create` | 모임 생성 |
| GET | `/clubs/read/:id` | 특정 모임 조회 |
| POST | `/clubs/update/:id` | 모임 수정 |
| DELETE | `/clubs/delete/:id` | 모임 삭제 |
| POST | `/clubs/addMember/:id` | 모임 가입 |
| GET | `/clubs/home/recommend` | 맞춤 추천 모임 |
| POST | `/userSigns/register` | 회원가입 |
| POST | `/userSigns/login` | 로그인 |
| POST | `/users/refresh-token` | 액세스 토큰 갱신 |
| GET | `/meetings/:clubNumber` | 정기모임 목록 |
| POST | `/meetings/create` | 정기모임 생성 |
| POST | `/clubs/boards/posts` | 게시글 작성 |
| GET | `/clubs/gallery/:clubNumber/images` | 갤러리 목록 |

---

## 개발 과정 및 트러블슈팅

자세한 개발 과정과 문제 해결 기록은 아래 문서를 참고하세요.

[개발 과정 및 트러블슈팅 보기](./project-overview.md)
