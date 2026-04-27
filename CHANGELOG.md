# CHANGELOG

Clubing 프로젝트의 개선 이력을 기록합니다.

---

## [v2.0] — 2025-04 UI/UX 전면 개선

### 🐛 버그 수정

#### 채팅 — 소켓 중복 렌더링

- **원인:** `socket.on("message")` 리스너가 `connect` 이벤트 핸들러 내부에 등록되어, 재연결 시마다 리스너가 누적됨
- **수정:** 리스너를 `connect` 밖으로 분리 + `_id` 기준 중복 메시지 필터 추가

```js
// Before — connect 안에 등록 (재연결마다 중복 쌓임)
newSocket.on("connect", () => {
  newSocket.on("message", (msg) => { ... });
});

// After — 바깥에서 한 번만 등록
newSocket.on("connect", () => { newSocket.emit("joinRoom", ...); });
newSocket.on("message", (msg) => {
  setMessages((prev) => {
    if (prev.some((m) => m._id === msg._id)) return prev;
    return [...prev, msg];
  });
});
```

#### 채팅 — 이전 메시지 로드 시 스크롤 점프

- **원인:** `latestMessageRef` useEffect가 `messages` 배열 변경마다 실행되어 위로 스크롤하면 맨 아래로 튕김
- **수정:** `initialScrollDone` ref 도입 — 초기 로드 시 1회만 스크롤, 이후 무한 스크롤 방해 없음
- `currentMatchId`가 있을 때는 검색 스크롤이 우선 — 일반 스크롤 로직 억제

#### 갤러리 — 빈 상태 이미지 반응형 깨짐

- **원인:** `max-w-[600px]`만 있고 `w-full` 없어서 모바일에서 화면 밖으로 삐져나옴
- **수정:** `w-full` + `px-4` 추가

---

### ✨ 신규 기능

#### 채팅 — 전체 메시지 검색 및 위치 이동

백엔드에서 전체 메시지 대상 full-text 검색 후, 결과 위치로 자동 이동합니다.

**추가된 API (Backend)**

- `GET /:clubId/messages/search?query=검색어` — 전체 메시지 regex 검색 (limit 없음, ASC)
- `GET /:clubId/messages/around?timestamp=...` — 특정 시점 전후 50건 조회
- `GET /:clubId/messages?before=...&limit=30` — 타임스탬프 커서 방식 이전 메시지 로드

**추가된 Redux Actions (Frontend)**

- `searchMessages` — 검색어 디바운스(400ms) 후 백엔드 검색
- `loadMessagesAround` — 검색 결과 위치의 전후 메시지 로드
- `loadMessagesBefore` — around-mode에서 위로 스크롤 시 커서 방식 로드

**동작 흐름**

1. 검색어 입력 → 400ms 디바운스 → 백엔드 전체 검색
2. 결과 DESC 정렬 저장 (index 0 = 최신)
3. ↑ 버튼: 오래된 결과로 이동 / ↓ 버튼: 최신 결과로 이동
4. 해당 메시지가 로드된 목록에 없으면 `loadMessagesAround`로 교체 → `isAroundMode = true`
5. around-mode에서 위 스크롤 시 skip 방식 대신 타임스탬프 커서 방식 사용
6. 검색 닫으면 최신 메시지 리로드 + 일반 모드 복귀

#### 마이페이지 채팅 탭 — 최근 메시지 미리보기

채팅방 목록에 각 모임의 가장 최근 메시지를 표시합니다.

- `MyChatList`에서 클럽 fetch 시 `GET /:clubId/messages?limit=1`을 `Promise.all`로 병렬 호출
- 채팅방 미가입 / 오류 시 `null` 처리 (카드 깨짐 없음)
- `ClubCard3` 레이아웃 — 카카오톡 채팅 목록 스타일로 재구성

---

### 🎨 UI/UX 개선

#### 게시판

- 글/투표 등록 후 `queryClient.invalidateQueries(["posts"])` 추가 → 새로고침 없이 목록 즉시 반영
- 글쓰기 버튼: 원형 FAB → **Extended FAB** (아이콘 + "글쓰기" 텍스트)

#### 갤러리 — 이미지 등록/수정 모달

- 모달 너비: `max-w-2xl` → **`max-w-5xl`**
- `p-8` 패딩 제거 → flex-column 구조 (헤더 고정 + 본문 스크롤)
- 모달 헤더: 제목("이미지 등록" / "이미지 수정") + X 버튼 추가

#### 갤러리 — GalleryCreate 컴포넌트 반응형 개편

- 기존: 고정 세로 레이아웃
- 변경: `lg:flex-row` — 에디터(60%) + 사이드바(40%) 2열 구조
- 이미지 썸네일: 고정 크기 → `aspect-square` 반응형
- 업로드 버튼: 전체 너비 점선 테두리 스타일

#### 홈 — 신규 모임 3D 캐러셀

| 항목          | 변경 전             | 변경 후                           |
| ------------- | ------------------- | --------------------------------- |
| 컨테이너 높이 | 320px               | **420px**                         |
| 카드 크기     | 130 × 100px         | **200 × 160px**                   |
| 이미지 높이   | 65px                | **110px**                         |
| 회전 반경     | `max(180, 개수×28)` | **`max(260, 개수×38)`**           |
| hover 동작    | 계속 회전           | **일시정지 (0.6s ease-out 감속)** |

#### 정모일정 — MeetingCard 세로형 전환

- 가로형(이미지 좌측 120px 고정) → **세로형(상단 16:9 이미지)**
- 정원 마감 시 "마감" 뱃지 + 인원 수 빨간색 표시
- 그리드: `sm:grid-cols-2` → **`lg:grid-cols-3`** 3열 대응
- 스켈레톤 로딩도 세로형 구조로 통일 (4개 → 6개)

#### 비슷한 클럽 캐러셀 (모임 상세 홈)

- `ClubCard`: 가로형 → **세로형 (16:9 이미지 + 텍스트)**, 하드코딩 색상/mock 데이터 제거
- `ClubCarousel`: `bg-gray-100` 박스 제거, **자동 재생 3초 + hover 일시정지 + 좌우 커스텀 버튼**

#### 마이페이지 채팅 탭 — ClubCard3

- 기존: 썸네일(110px) + 제목/부제목 + 멤버 아바타
- 변경: **썸네일(72px 정사각형) + 제목/시간 + 최근 메시지 + 멤버 아바타**
- 시간 포맷: 방금 / n분 전 / n시간 전 / 어제 / n일 전 / 월/일

#### 모임 찾기 — 무한 스크롤 임계값

- `scrollHeight - 10` (완전 바닥) → **`scrollHeight - 500`** (바닥 500px 전 미리 로드)

#### 푸터 디자인 전면 교체

- 배경색: `khaki-800 (#565903, 올리브 녹색)` → **`primary-100 (#f2ebe3, 따뜻한 베이지)`**
- 브랜드 태그라인, 운영시간, 개인정보처리방침/이용약관 링크 추가
- 소셜 아이콘 → 둥근 버튼 (hover 시 primary 색상)

---

### 🗑️ 제거된 파일

| 파일                                                   | 이유                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `frontend/src/components/club/BubbleAnimation.js`      | 미사용                                                       |
| `frontend/src/components/commonEffect/GalleryInput.js` | 미사용                                                       |
| `frontend/src/pages/club/clublayput/Footer.jsx`        | `<div>Footer</div>` 껍데기 (실제 푸터는 `layout/Footer.jsx`) |

---

### 🛠️ 공통 / 기반

- `src/index.css` — `.scrollbar-hide` 유틸리티 추가 (Chrome/Firefox/Safari 대응)
- `frontend/README.md` — 프로젝트 전용 개발 가이드로 전면 개편 (CRA 기본 내용 유지)
- `backend/README.md` — 신규 작성 (API 명세 + 채팅 API 상세)
- `README.md` (루트) — 신규 작성 (프로젝트 전체 개요 + 빠른 시작)
