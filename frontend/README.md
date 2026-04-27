# Clubing — Frontend

React 18 기반 프론트엔드 클라이언트입니다.

---

## 개발 환경 실행

```bash
npm install
npm start   # http://localhost:3000
```

---

## 컴포넌트 구조

```
src/
├── components/
│   ├── auth/           # Snackbar, MessageModal, MessageRow 등
│   ├── club/           # ClubCard, ClubCarousel, ClubListCard 등 모임 관련 공통 컴포넌트
│   └── commonEffect/   # AnimatedCard, HomeCard 등 시각 효과 컴포넌트
├── pages/
│   ├── home/           # 홈 화면 (히어로 배너, 신규모임 3D 캐러셀, 추천 모임 등)
│   ├── club/
│   │   ├── main/       # 모임 상세 홈 탭 (정기모임, 멤버, 비슷한 클럽)
│   │   ├── board/      # 게시판 (글쓰기, 투표, 목록)
│   │   ├── gallery/    # 사진첩 (이미지 등록/편집/삭제)
│   │   ├── meeting/    # 정모일정 탭 (날짜별, 카테고리별, 맞춤추천)
│   │   └── clublayput/ # 모임 공통 레이아웃, 헤더, NavBar
│   ├── chat/           # 실시간 채팅 (메시지 검색, 무한 스크롤)
│   ├── myPage/         # 마이페이지 (내 모임, 채팅, 메시지, 설정)
│   └── auth/           # 로그인, 회원가입
├── store/
│   ├── actions/        # 비동기 액션 (chatActions, myMessageActions 등)
│   └── reducers/       # Redux 슬라이스
├── api/                # Axios 기반 API 호출 모듈 (ClubBoardApi, ClubGalleryApi 등)
├── layout/
│   ├── Header.jsx      # 전역 헤더
│   └── Footer.jsx      # 전역 푸터
└── utils/
    └── axios.js        # Axios 인스턴스 (baseURL, 인터셉터)
```

---

## 디자인 시스템

### 색상 팔레트 (tailwind.config.js)

| 토큰          | 색상값    | 용도                 |
| ------------- | --------- | -------------------- |
| `primary-50`  | `#faf7f4` | 배경, 호버 영역      |
| `primary-100` | `#f2ebe3` | 푸터 배경, 카드 배경 |
| `primary-300` | `#d4b99e` | 테두리, 보조 요소    |
| `primary-500` | `#b87f5a` | 포인트 텍스트        |
| `primary-600` | `#a6836f` | 버튼, 주요 액션      |
| `primary-900` | `#5c473e` | 진한 텍스트          |

### 폰트

| 클래스             | 폰트                  |
| ------------------ | --------------------- |
| `font-nanum`       | NanumSquareNeo (기본) |
| `font-nanum-bold`  | NanumSquareNeoBold    |
| `font-nanum-light` | NanumSquareNeoLight   |

---

## 주요 개선 사항 (v2)

### 채팅 (`pages/chat/`)

- **전체 메시지 검색** 기능 추가 — 백엔드 full-text 검색, 결과 위치로 자동 스크롤
- **검색 결과 네비게이션** — ↑(오래된 순) / ↓(최신 순) 이동, 현재 위치 표시
- **Around-mode 페이지네이션** — 검색 결과 위치의 전후 메시지를 불러오는 커서 방식 구현
- **소켓 중복 렌더링 버그 수정** — 리스너를 `connect` 이벤트 밖으로 분리 + `_id` 기준 중복 필터
- **스크롤 점프 버그 수정** — `initialScrollDone` ref로 초기 1회만 스크롤, 이후 무한 스크롤 방해 없음
- **검색 종료 시 최신 메시지 리로드** — 검색 닫으면 일반 모드로 복귀 + `messageListResetKey`로 스크롤 리셋

### 게시판 (`pages/club/board/`)

- 글/투표 등록 후 `queryClient.invalidateQueries(["posts"])` — 새로고침 없이 목록 즉시 반영
- 글쓰기 FAB → **Extended FAB** (아이콘 + "글쓰기" 텍스트 라벨)

### 갤러리 (`pages/club/gallery/`)

- 이미지 등록/수정 모달 → `max-w-2xl` → **`max-w-5xl`** 와이드 리디자인
- `GalleryCreate` 내부 레이아웃 → 세로 단일 구조 → **`lg:flex-row` 반응형 (에디터 60% + 사이드바 40%)**
- 빈 이미지 상태 이미지 반응형 수정 — `w-full` + `px-4` 추가

### 마이페이지 채팅 탭 (`pages/myPage/sections/MyChat/`)

- 클럽별 **최근 메시지 1건 fetch** → `MyChatList`에서 `Promise.all` 병렬 처리
- `ClubCard3` 카드 레이아웃 재구성 — 카카오톡 채팅 목록 스타일
  - 1행: 모임명 + 상대 시간 (방금 / n분 전 / 어제 / n일 전)
  - 2행: 최근 메시지 미리보기 (`📷 사진` or 텍스트 or italic 안내문)
  - 3행: 멤버 아바타 + 인원

### 홈 (`pages/home/Home.jsx`)

- **신규 모임 3D 캐러셀** 카드 크기 업 — 130×100 → **200×160px**, 이미지 65 → **110px**, 컨테이너 320 → **420px**
- **hover 시 자동 회전 일시 정지** — `carouselPaused` state + `0.6s ease-out` 감속 전환

### 정모일정 탭 (`pages/club/meeting/`)

- `MeetingCard` — 가로형(이미지 좌측 120px) → **세로형(상단 16:9 이미지)** 카드
- 정원 마감 시 **"마감" 뱃지** + 인원 수 빨간색 표시
- 그리드 `sm:grid-cols-2` → **`lg:grid-cols-3`** 3열 대응
- 스켈레톤 로딩도 세로형 구조로 통일

### 모임 상세 홈 탭 — 비슷한 클럽 (`components/club/`)

- `ClubCarousel` — `react-slick` 유지, **자동 재생 3초** + **hover 시 일시정지** + **좌우 커스텀 버튼**
- `ClubCard` — 가로형 → **세로형 (16:9 이미지 + 제목/지역/인원)**, 하드코딩 색상 제거

### 모임 찾기 (`pages/club/Clubs.jsx`)

- 무한 스크롤 트리거 임계값 — `scrollHeight - 10` → **`scrollHeight - 500`** (바닥 500px 전 미리 로드)

### 공통 레이아웃

- **Footer** 색상 — `khaki-800(#565903 올리브)` → **`primary-100(#f2ebe3 따뜻한 베이지)`** + 콘텐츠 보강
- **`scrollbar-hide`** 유틸리티 CSS 추가 (`index.css`)

---

## Redux 전역 상태 관리

### 스토어 구조

```
store/
├── reducers/
│   ├── userSlice.js        # 로그인 사용자 정보, 스낵바 알림
│   ├── chatSlice.js        # 채팅 상태 (메시지 목록, 검색 결과, around-mode 등)
│   ├── wishSlice.js        # 찜한 모임 목록
│   ├── myMessageSlice.js   # 개인 메시지
│   └── recentVisitSlice.js # 최근 방문 모임
└── actions/
    ├── userActions.js      # 비동기 로그인/회원가입 액션
    ├── chatActions.js      # 채팅 관련 비동기 액션 (searchMessages, loadMessagesAround 등)
    └── myMessageActions.js # 개인 메시지 비동기 액션
```

### redux-persist

새로고침하면 메모리의 Redux 상태가 초기화됩니다. `redux-persist`는 상태를 `localStorage`에 저장해 **새로고침 후에도 로그인 유지, 찜 목록 유지**가 가능합니다.

```js
// store/index.js
const persistConfig = {
  key: "root",
  storage, // localStorage 사용
  whitelist: ["user", "chat", "wish"], // 유지할 상태 목록
};
```

---

## 트러블슈팅

### Git 파일명 대소문자 문제

**상황**: Windows에서는 `header.jsx`와 `Header.jsx`를 같은 파일로 인식하지만, Linux 서버(GitHub)에서는 다른 파일로 인식해 import가 실패함.

**원인**: Windows(NTFS)는 대소문자를 **구분하지 않음**. Linux는 대소문자를 **구분함**.

**해결**:

```bash
# Git이 파일명 변경을 인식하도록 강제 rename
git mv header.jsx Header.jsx
git commit -m "fix: 파일명 대소문자 수정"
```

---

### 새로고침 시 로그인 상태 초기화

**상황**: 페이지를 새로고침하면 Redux 상태(로그인 정보)가 사라짐.

**원인**: Redux의 상태는 **메모리**에 저장되므로 새로고침 시 초기화됨.

**해결**: `redux-persist`를 사용해 Redux 상태를 `localStorage`에 자동 저장 → 새로고침 후에도 로그인 상태 및 찜 목록 유지.

---

### 채팅 메시지 방향 조건부 UI

**상황**: 내가 보낸 메시지는 오른쪽, 상대방 메시지는 왼쪽에 표시되어야 함.

**해결**: 삼항 연산자로 현재 로그인 사용자와 메시지 발신자를 비교해 스타일 분기 처리.

```jsx
// 내 메시지: 오른쪽 / 상대 메시지: 왼쪽
<Box sx={{ justifyContent: message.sender === currentUser ? "flex-end" : "flex-start" }}>{message.content}</Box>
```

---

## 학습 포인트

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

---

## 삭제된 미사용 파일

| 파일                                      | 이유                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| `components/club/BubbleAnimation.js`      | 어디서도 import 되지 않음                                   |
| `components/commonEffect/GalleryInput.js` | 어디서도 import 되지 않음                                   |
| `pages/club/clublayput/Footer.jsx`        | `<div>Footer</div>` 껍데기, 실제 푸터는 `layout/Footer.jsx` |

---

## CRA 기본 스크립트

### `npm start`

개발 모드로 앱을 실행합니다.  
[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### `npm test`

인터랙티브 감시 모드로 테스트 러너를 실행합니다.

### `npm run build`

프로덕션용으로 `build` 폴더에 앱을 빌드합니다.  
프로덕션 모드로 React를 번들링하고 성능 최적화를 적용합니다.

### `npm run eject`

> **주의:** 되돌릴 수 없는 작업입니다.

빌드 도구와 설정을 프로젝트로 복사합니다. 직접 제어가 필요할 때만 사용하세요.

---

자세한 CRA 문서: [Create React App 공식 문서](https://facebook.github.io/create-react-app/docs/getting-started)
