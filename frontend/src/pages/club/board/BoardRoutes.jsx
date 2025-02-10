import { Routes, Route } from 'react-router-dom';
import Board from './Board';
import BoardRead from './ReadPage'
import BoardVote from './votePage'


//여기까지 경로 /clubs/boards 
function BoardRoutes() {
  return (
     
    <Routes>
      <Route path='' element={<Board />} />
      <Route path='read/:id' element={<BoardRead />} /> 
      <Route path='vote/:id' element={<BoardVote />} /> 
      {/* <Route path='/create' element={<BoardCreate />} />
      <Route path='update/:id' element={<BoardUpdate />} /> */}
    </Routes>
  );
}

export default BoardRoutes;