import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyUpdate from './sections/MyUpdate/MyUpdate';
import MyClub from './sections/MyClub/MyClub';
import MyMessage from './sections/MyMessage/MyMessage';
import MyChat from './sections/MyChat';
import MySetting from './sections/MySetting';
import MyPage from './MyPage';

//여기까지 경로 /mypage
function MyPageRoutes({ }) {
  return (
    <Routes>
      <Route path="/" element={<MyPage />}>
        <Route path="myclub" element={<MyClub />} />
        <Route path="chat" element={<MyChat />} />
        <Route path="myupdate" element={<MyUpdate />} />
        <Route path="mymessage" element={<MyMessage />} />
        <Route path="setting" element={<MySetting />} />
      </Route>
    </Routes>
  );
}

export default MyPageRoutes;
