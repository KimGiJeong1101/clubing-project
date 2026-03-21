# Clubing (클러빙) — 프로젝트 개발 과정

> MERN 스택을 활용한 소모임 플랫폼 웹사이트 레퍼런스 개발 기록

---

## 프로젝트 개요

| 항목       | 내용                                      |
| ---------- | ----------------------------------------- |
| 프로젝트명 | Clubing (클러빙)                          |
| 개발 기간  | 2024년 8월 ~ 2024년 9월                   |
| 개발 인원  | 5명                                       |
| 목표       | MERN 스택으로 소모임 커뮤니티 플랫폼 구현 |

---

## 아키텍처 및 기술 스택

### 전체 구조

```
브라우저 (React)
    ↕ HTTP REST API (Axios)
Express 서버 (Node.js)
    ↕ WebSocket (Socket.io) ← 실시간 채팅
MongoDB (Mongoose)
```

> **구조를 쉽게 이해하기**
>
> - **브라우저(React)**: 사용자가 보는 화면. 버튼 클릭, 폼 입력 등 UI를 담당합니다.
> - **Express 서버**: 브라우저의 요청을 받아 처리하고 데이터베이스에서 데이터를 꺼내거나 저장합니다.
> - **MongoDB**: 사용자 정보, 모임 데이터, 채팅 메시지 등 모든 데이터가 저장되는 곳입니다.
> - **Socket.io**: 일반 HTTP는 요청을 해야만 응답이 오지만, 소켓은 서버가 먼저 데이터를 밀어줄 수 있어 실시간 채팅에 사용됩니다.

### Frontend

- **React.js** — 컴포넌트 기반 UI 개발
- **MUI (Material-UI)** — 디자인 컴포넌트 라이브러리
- **React Query + Axios** — API 통신 및 서버 데이터 캐싱
- **Redux Toolkit** — 전역 상태 관리 (로그인 정보, 채팅 상태 등)
- **redux-persist** — 새로고침 후에도 Redux 상태 유지 (localStorage)

### Backend

- **Node.js + Express** — REST API 서버
- **Socket.io** — 실시간 채팅 (WebSocket)
- **MongoDB + Mongoose** — 데이터 저장 및 스키마 관리

### CI/CD

- **GitHub Actions + Prettier** — 코드 포맷 자동 검사 및 수정

---

## 주요 구현 설명

### 1. JWT 인증 시스템

**개념**: JWT(JSON Web Token)는 사용자가 로그인했음을 증명하는 "디지털 신분증"입니다.

**동작 흐름**:

```
1. 사용자가 이메일+비밀번호로 로그인
2. 서버가 JWT accessToken(짧은 유효기간) + refreshToken(긴 유효기간) 발급
3. 두 토큰을 HTTP-Only 쿠키로 브라우저에 저장
4. 이후 모든 API 요청마다 쿠키가 자동으로 전송 → 서버가 검증
5. accessToken이 만료되면 refreshToken으로 자동 재발급
6. refreshToken도 만료되면 로그인 페이지로 이동
```

**왜 쿠키에 저장하나요?**
`localStorage`에 저장하면 JavaScript로 접근이 가능해 XSS(사이트 간 스크립트) 공격에 취약합니다. `HTTP-Only 쿠키`는 JavaScript에서 직접 접근할 수 없어 더 안전합니다.

**관련 코드**:

- `backend/src/middleware/auth.js` — JWT 검증 미들웨어
- `frontend/src/utils/axios.js` — 토큰 만료 시 자동 갱신 인터셉터

---

### 2. 실시간 채팅 (Socket.io)

**개념**: 일반 HTTP 통신은 클라이언트가 요청해야만 서버가 응답합니다. 하지만 채팅은 상대방이 메시지를 보내면 내가 **즉시** 받아야 합니다. 이를 위해 **WebSocket**(영구 연결)을 사용합니다.

**문제**: Express는 기본적으로 HTTP만 지원합니다.

**해결 방법**: Express 앱을 Node.js의 `http` 모듈로 감싸서 Socket.io와 연결했습니다.

```js
// 잘못된 방법 (Express만으로는 소켓 연결 불가)
const app = express();
const io = socketIo(app); // 에러!

// 올바른 방법
const app = express();
const server = http.createServer(app); // Express를 HTTP 서버로 감싸기
const io = socketIo(server); // HTTP 서버에 소켓 연결
server.listen(4000); // app.listen() 대신 server.listen()
```

**채팅 흐름**:

```
사용자 A가 메시지 입력
    → 클라이언트: socket.emit("message", { content: "안녕!" })
    → 서버: io.to(roomId).emit("message", ...) — 같은 방의 모든 사용자에게 전송
    → 사용자 B, C: 화면에 메시지 즉시 표시
    → 서버: MongoDB에 메시지 저장 (나중에 기록 조회 가능)
```

**관련 코드**:

- `backend/index.js` — http 서버 + Socket.io 초기화
- `backend/src/routes/message.js` — 소켓 이벤트 핸들러

![Socket.io 설정](./frontend/guide_images/http객체%20활용%20소켓io%20설정.PNG)

---

### 3. 이미지 업로드 및 썸네일 생성

**개념**: 사용자가 이미지를 올리면 원본을 저장하고, 목록 화면처럼 작게 보여주는 곳에는 **썸네일(축소 이미지)** 을 사용합니다. 매번 원본을 전송하면 용량이 너무 크기 때문입니다.

**동작 흐름**:

```
사용자가 이미지 선택
    → Multer: 서버에 파일 저장 (날짜별 폴더 분류)
    → Sharp: 이미지를 리사이징해 썸네일 생성
    → 원본 경로 + 썸네일 경로 모두 DB에 저장
    → 목록 화면: 썸네일 사용 (빠른 로딩)
    → 상세 화면: 원본 사용 (고화질)
```

**사용 라이브러리**:

- **Multer** — 파일 업로드를 처리하는 Express 미들웨어. 어떤 폴더에 어떤 이름으로 저장할지 설정합니다.
- **Sharp** — 고성능 이미지 처리 라이브러리. 빠르게 리사이징, 포맷 변환이 가능합니다.
- **UUID** — 업로드된 파일명이 겹치지 않도록 고유한 이름을 생성합니다.

---

### 4. 맞춤 모임 추천 시스템

**개념**: 사용자가 가입할 때 입력한 관심사, 지역, 직업 정보를 바탕으로 관련된 모임을 우선 보여줍니다.

**점수 기반 정렬**:

```
지역 점수 (regionScore):
  - 내 동네와 같은 모임 → 0점 (가장 가까움)
  - 같은 구 모임        → 1점
  - 같은 시 모임        → 2점
  - 해당 없음           → 3점

카테고리 점수 (categoryScore):
  - 세부 관심사 일치    → 0점
  - 대분류 관심사 일치  → 1점
  - 해당 없음           → 2점

→ 두 점수 합산이 낮을수록 상단에 노출
```

MongoDB의 **Aggregation Pipeline**을 사용해 서버에서 직접 점수 계산 후 정렬합니다.

**로그인 안 한 사용자**: 최신 모임 순으로 표시합니다.

---

### 5. Redux 전역 상태 관리

**개념**: React 컴포넌트는 부모→자식 방향으로만 데이터를 전달할 수 있습니다. 하지만 로그인 정보처럼 **앱 전체에서 필요한 데이터**를 매번 props로 전달하면 코드가 복잡해집니다. Redux는 "전역 저장소"를 만들어 어느 컴포넌트에서든 직접 접근할 수 있게 합니다.

**이 프로젝트의 Redux 구조**:

```
store/
├── reducers/
│   ├── userSlice.js        # 로그인 사용자 정보, 스낵바 알림
│   ├── chatSlice.js        # 채팅 상태
│   ├── wishSlice.js        # 찜한 모임 목록
│   ├── myMessageSlice.js   # 개인 메시지
│   └── recentVisitSlice.js # 최근 방문 모임
└── actions/
    ├── userActions.js      # 비동기 로그인/회원가입 액션
    └── chatActions.js      # 채팅 관련 비동기 액션
```

**redux-persist**: 새로고침하면 메모리의 Redux 상태가 초기화됩니다. `redux-persist`는 상태를 `localStorage`에 저장해 새로고침 후에도 로그인 유지, 찜 목록 유지 등이 가능합니다.

---

### 6. GitHub Actions CI/CD — 코드 포맷 자동화

**개념**: 팀 프로젝트에서 사람마다 다른 코드 스타일을 사용하면 코드 리뷰가 어렵고 Git diff가 지저분해집니다. **Prettier**를 사용해 코드 스타일을 강제로 통일합니다.

**GitHub Actions 워크플로우 동작 순서**:

```
1. 개발자가 코드 push 또는 PR 생성
2. GitHub Actions 자동 실행
3. 프론트엔드/백엔드 npm install
4. npx prettier --check . → 포맷 규칙 위반 파일 확인
5. npx prettier --write . → 자동으로 포맷 수정
6. 변경사항 자동 커밋 & 원격 브랜치에 push
```

**설정 파일**: `.github/workflows/prettier.yml`

![GitHub Actions 동작 과정](./frontend/guide_images/깃허브%20액션%20이용해서%20프리티어%20룰%20적용%20과정.png)

---

### 7. 카카오 소셜 로그인 (OAuth 2.0)

**개념**: OAuth는 제3자(카카오, 구글 등)가 사용자 인증을 대신해주는 표준 방식입니다. 사용자는 플랫폼에 비밀번호를 직접 입력하지 않아도 됩니다.

**흐름**:

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

## 트러블슈팅

### 문제 1: Express에서 Socket.io 연결 안 됨

**상황**: `const io = socketIo(app)` 방식으로 연결하면 소켓이 정상 작동하지 않음.

**원인**: Socket.io는 Express 앱 객체가 아닌 **Node.js HTTP 서버 객체**와 연결해야 합니다. Express는 내부적으로 HTTP 서버를 만들어주지만, 직접 접근이 안 됩니다.

**해결**:

```js
const http = require("http");
const server = http.createServer(app); // Express를 HTTP 서버로 감싸기
const io = socketIo(server); // HTTP 서버에 소켓 연결
server.listen(process.env.PORT); // server.listen() 사용
```

**결과**: 실시간 채팅 정상 작동

---

### 문제 2: Git 파일명 대소문자 문제

**상황**: Windows에서는 `header.jsx`와 `Header.jsx`를 같은 파일로 인식하지만, Linux 서버(GitHub)에서는 다른 파일로 인식해 import가 실패함.

**원인**: Windows의 파일 시스템(NTFS)은 대소문자를 **구분하지 않음**. Linux는 대소문자를 **구분함**.

**해결**:

```bash
# Git이 파일명 변경을 인식하도록 강제 rename
git mv header.jsx Header.jsx
git commit -m "fix: 파일명 대소문자 수정"
```

**결과**: GitHub와 로컬 환경 모두 정상 작동

---

### 문제 3: 새로고침 시 로그인 상태 초기화

**상황**: 페이지를 새로고침하면 Redux 상태(로그인 정보)가 사라짐.

**원인**: Redux의 상태는 **메모리**에 저장되므로 새로고침 시 초기화됨.

**해결**: `redux-persist`를 사용해 Redux 상태를 `localStorage`에 자동 저장.

```js
// store/index.js
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage 사용

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "chat", "wish", ...], // 유지할 상태 목록
};
```

**결과**: 새로고침 후에도 로그인 상태 및 찜 목록 유지

---

### 문제 4: 조건부 UI (채팅 메시지 방향)

**상황**: 내가 보낸 메시지는 오른쪽, 상대방 메시지는 왼쪽에 표시되어야 함.

**해결**: 삼항 연산자로 현재 로그인 사용자와 메시지 발신자를 비교해 스타일 분기 처리.

```jsx
// 내 메시지: 오른쪽 / 상대 메시지: 왼쪽
<Box sx={{ justifyContent: message.sender === currentUser ? "flex-end" : "flex-start" }}>{message.content}</Box>
```

시간 표시도 12/24시간 형식으로 조건부 표시.

![조건부 UI 설명](./frontend/guide_images/조건부%20UI%20설명.PNG)

---

## 데이터베이스 설계

### 주요 컬렉션(Collection) 관계

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

MongoDB의 기본 ID(`ObjectId`)는 24자리 문자열이라 URL에 사용하기 불편합니다. 이 프로젝트에서는 `Counter` 컬렉션을 이용해 Club, Board, Meeting, Event에 **숫자 자동증가 ID**를 부여합니다.

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

## 학습 포인트 정리

이 프로젝트를 통해 학습한 핵심 개념들입니다.

| 개념        | 배운 내용                                                   |
| ----------- | ----------------------------------------------------------- |
| REST API    | URL은 리소스(명사), HTTP 메서드는 행동(동사)으로 설계       |
| JWT 인증    | accessToken + refreshToken 이중 토큰으로 보안과 편의성 균형 |
| WebSocket   | 실시간 양방향 통신을 위한 HTTP와의 차이점                   |
| 비동기 처리 | async/await, Promise로 DB 쿼리와 API 호출 처리              |
| Redux       | 전역 상태의 필요성과 액션-리듀서-스토어 패턴                |
| React Query | 서버 상태와 클라이언트 상태를 분리하는 이유                 |
| CI/CD       | GitHub Actions로 코드 품질을 자동으로 유지하는 방법         |
| OAuth       | 제3자 인증 흐름(카카오 로그인)의 동작 원리                  |
| MongoDB     | NoSQL의 유연한 스키마와 Aggregation Pipeline 활용           |
