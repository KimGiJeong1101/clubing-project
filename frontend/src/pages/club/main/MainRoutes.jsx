import { Routes, Route } from 'react-router-dom';
import Main from './Main';
import MainCreate from '../ClubCreate';
import MainUpdate from './MainUpdate';

//여기까지 경로 /clubs/galleries 
function MainRoutes() {
  return (
    <Routes>
      <Route path='' element={<Main />} />
      <Route path='create' element={<MainCreate />} />
      <Route path='update' element={<MainUpdate />} />
    </Routes>
  );
}

export default MainRoutes;
