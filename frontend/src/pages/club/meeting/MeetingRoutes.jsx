import { Routes, Route } from 'react-router-dom';
import MeetingCreate from './MeetingCreate';
import MeetingUpdate from './MeetingUpdate';

//여기까지 경로 /clubs/meetings 
function MeetingRoutes() {
  return (
    <Routes>
      <Route path='create' element={<MeetingCreate />} />
      <Route path='update/:id' element={<MeetingUpdate />} />
    </Routes>
  );
}

export default MeetingRoutes;
