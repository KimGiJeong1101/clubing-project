import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import NotFound from "./pages/common/NotFound";
import ClubRoutes from "./pages/club/ClubRoutes";
import MyPageRoutes from "./pages/myPage/index"; // 마이페이지 관련 라우트
import ClubLayout from "./pages/club/clublayput/ClubLayout";
import Clubs from "./pages/club/Clubs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import ProtectedRoutes from "./components/common/ProtectedRoutes";
import NotAuthRoutes from "./components/common/NotAuthRoutes";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SnsRegister from "./pages/auth/RegisterPage/SnsRegister";
import { authUser } from "./store/actions/userActions";
import "./App.css";
import ClubCreate from "./pages/club/ClubCreate";
import MeetingList from "./pages/club/meeting/MeetingList";
import Board from "./pages/club/board/Board";
import Home from "./pages/home/Home"
import Event from "./pages/event/Event";
import RecommendedClubList from './pages/recommend/RecommendedClubList'
import KakaoCallback from "./pages/auth/LoginPage/KakaoCallback";
import HeaderDisplay from "./pages/check/HeaderDisplay";

function App() {
  const dispatch = useDispatch();
  // Redux의 액션을 디스패치하기 위해 사용됩니다.
  const isAuth = useSelector((state) => state.user?.isAuth);
  // Redux 상태에서 필요한 부분을 추출하기 위해 사용됩니다.
  //여기서는 사용자 인증 상태(isAuth)를 가져오고 있습니다.
  const { pathname } = useLocation();
  //현재 URL 경로 (pathname)를 가져오는 데 사용됩니다.

  useEffect(() => {
    //useEffect는 특정 조건이 변경될 때 실행되는 사이드 이펙트를 처리합니다.
    if (isAuth) {
      dispatch(authUser());
      //isAuth가 true일 때:
      //authUser 액션을 디스패치하여 사용자 인증 상태를 확인하거나 갱신합니다.
      //성공적으로 인증 정보를 가져오면,
      //user 리듀서에서 isAuth와 사용자 데이터를 업데이트합니다.
    }
  }, [isAuth, pathname, dispatch]);
  //isAuth(인증 상태) 또는 pathname(경로 naver.com/login)이 변경될 때마다 authUser 액션을 디스패치합니다.
  //이때 dispatch는 의존성 배열에 포함되어, 디스패치 함수가 변경되면 useEffect도 다시 실행됩니다.

  return (
    <Routes>
      {/* ClubLayout을 사용하는 경로 */}
      <Route path="/clubs" element={<ClubLayout />}>
        <Route path="/clubs/board" element={<Board />} />
        <Route path="*" element={<ClubRoutes />} />
      </Route>

      {/* 기본 Layout을 사용하는 경로 */}
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Home />} />
        <Route path="/clublist" element={<Clubs />} />
        <Route path="/meetingList" element={<MeetingList />} />
        <Route path="/recommendedClubList" element={<RecommendedClubList/>}></Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/event" element={<Event/>}/>

        {/* 로그인한 사람만 갈 수 있는 경로 */}
        <Route element={<ProtectedRoutes isAuth={isAuth} />}>
          <Route path="/clubs/create" element={<ClubCreate />} />
          <Route path="/mypage/*" element={<MyPageRoutes />} />
        </Route>

        {/* 로그인한 사람은 갈 수 없는 경로 */}
        <Route element={<NotAuthRoutes isAuth={isAuth} />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/snsregister" element={<SnsRegister />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />
        </Route>

        <Route path="/headers" element={<HeaderDisplay />} />
      </Route>
    </Routes>
  );
}

export default App;
