import { Routes, Route } from "react-router-dom";
import ChatPage from "./index"; // chat/:id를 처리할 컴포넌트

const ChatRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
    </Routes>
  );
};

export default ChatRoutes;
