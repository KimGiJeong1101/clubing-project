# Clubing 🤝

> 나와 맞는 사람들과 함께하는 취미 모임 플랫폼

## 프로젝트 소개

**Clubing**은 관심사 기반의 소모임을 찾고, 만들고, 함께 활동할 수 있는 커뮤니티 플랫폼입니다.  
카테고리별 모임 탐색, 실시간 채팅, 정기모임 관리, 갤러리 공유 등 모임 활동에 필요한 기능을 제공합니다.

| 항목      | 내용                                      |
| --------- | ----------------------------------------- |
| 개발 기간 | 2024년 8월 ~ 2024년 9월                   |
| 개발 인원 | 5명                                       |
| 목표      | MERN 스택으로 소모임 커뮤니티 플랫폼 구현 |

---

## 시스템 아키텍처

```
브라우저 (React)
    ↕ HTTP REST API (Axios)
Express 서버 (Node.js)
    ↕ WebSocket (Socket.io) ← 실시간 채팅
MongoDB (Mongoose)
```

> - **브라우저(React)**: 사용자가 보는 화면. 버튼 클릭, 폼 입력 등 UI를 담당합니다.
> - **Express 서버**: 브라우저의 요청을 받아 처리하고 데이터베이스에서 데이터를 꺼내거나 저장합니다.
> - **MongoDB**: 사용자 정보, 모임 데이터, 채팅 메시지 등 모든 데이터가 저장되는 곳입니다.
> - **Socket.io**: 서버가 먼저 데이터를 밀어줄 수 있어 실시간 채팅에 사용됩니다.

---

## 기술 스택

### Frontend

| 분류        | 기술                                               |
| ----------- | -------------------------------------------------- |
| 프레임워크  | React 18 (Create React App)                        |
| 상태 관리   | Redux Toolkit, React Query (@tanstack/react-query) |
| 라우팅      | React Router v6                                    |
| 스타일      | Tailwind CSS v3 (커스텀 primary brown 팔레트)      |
| 실시간 통신 | Socket.io-client                                   |
| 이미지 편집 | TOAST UI Image Editor                              |
| 애니메이션  | Framer Motion                                      |
| 아이콘      | React Icons (Feather)                              |
| 폰트        | NanumSquareNeo                                     |

### Backend

| 분류         | 기술                      |
| ------------ | ------------------------- |
| 런타임       | Node.js                   |
| 프레임워크   | Express.js                |
| 데이터베이스 | MongoDB + Mongoose        |
| 인증         | JWT, Passport.js          |
| 실시간 통신  | Socket.io                 |
| 파일 업로드  | Multer + Sharp            |
| CI/CD        | GitHub Actions + Prettier |

---

## 프로젝트 구조

```
clubing-project_git_ReF/
├── frontend/               # React 클라이언트
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── store/          # Redux 스토어 + Actions
│   │   ├── api/            # API 호출 모듈
│   │   ├── layout/         # 공통 레이아웃 (Header, Footer)
│   │   └── utils/          # 유틸리티 (axios 인스턴스 등)
│   └── README.md
├── backend/                # Express 서버
│   ├── src/
│   │   ├── models/         # Mongoose 스키마 모델
│   │   ├── routes/         # API 라우터
│   │   └── middleware/     # 인증 미들웨어 등
│   └── README.md
├── README.md               # 프로젝트 전체 개요 (현재 파일)
└── CHANGELOG.md            # 개선 이력
```

---

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- MongoDB 실행 중

### 설치 및 실행

```bash
# 1. 백엔드 실행
cd backend
npm install
npm start          # http://localhost:4000

# 2. 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm start          # http://localhost:3000
```

---

## 주요 기능

| 기능             | 설명                                                    |
| ---------------- | ------------------------------------------------------- |
| 🔍 모임 찾기     | 카테고리 / 지역 필터 + 무한 스크롤 (미리 로드)          |
| 💬 실시간 채팅   | Socket.io 기반, 전체 메시지 검색 + 위치 이동 지원       |
| 📅 정기모임      | 날짜별 / 카테고리별 정모 탐색 및 참석 신청              |
| 🖼️ 갤러리        | 이미지 업로드, TOAST UI 편집, 드래그 순서 변경          |
| 📋 게시판        | 일반 게시글 + 투표 기능, 등록 후 목록 즉시 반영         |
| 👤 마이페이지    | 내 모임 / 채팅 목록 (최근 메시지 미리보기), 프로필 관리 |
| 🎯 맞춤 추천     | 관심사 / 지역 기반 모임 및 정모 추천 (점수 기반 정렬)   |
| 🔐 카카오 로그인 | OAuth 2.0 기반 소셜 로그인                              |

---

## 맞춤 추천 시스템

사용자 가입 시 입력한 관심사, 지역, 직업 정보를 바탕으로 관련 모임을 우선 노출합니다.

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

MongoDB **Aggregation Pipeline**으로 서버에서 직접 점수 계산 후 정렬합니다.  
로그인하지 않은 사용자에게는 최신 모임 순으로 표시합니다.

---

## 관련 문서

- [프론트엔드 개발 가이드](./frontend/README.md)
- [백엔드 API 가이드](./backend/README.md)
- [개선 이력 (CHANGELOG)](./CHANGELOG.md)
