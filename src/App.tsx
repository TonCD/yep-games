import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LuckyWheelPage from './pages/LuckyWheelPage';
import BingoPage from './pages/BingoPage';
import ScoringPage from './pages/ScoringPage';
import ScoringRoomPage from './pages/ScoringRoomPage';
import JudgeScoringPage from './pages/JudgeScoringPage';
import DressCodeVotingPage from './pages/DressCodeVotingPage';
import DressCodeRoomPage from './pages/DressCodeRoomPage';
import DressCodeParticipantPage from './pages/DressCodeParticipantPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lucky-wheel" element={<LuckyWheelPage />} />
        <Route path="/bingo" element={<BingoPage />} />
        <Route path="/scoring" element={<ScoringPage />} />
        <Route path="/scoring/room/:roomId" element={<ScoringRoomPage />} />
        <Route path="/scoring/judge/:roomId/:judgeToken" element={<JudgeScoringPage />} />
        <Route path="/dresscode/create" element={<DressCodeVotingPage />} />
        <Route path="/dresscode/room/:roomCode" element={<DressCodeRoomPage />} />
        <Route path="/dresscode/join/:roomCode" element={<DressCodeParticipantPage />} />
      </Routes>
    </Router>
  );
}

export default App
