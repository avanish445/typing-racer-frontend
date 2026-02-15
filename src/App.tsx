import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomLobby from './pages/RoomLobby';
import Game from './pages/Game';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <GameProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/room/:code" element={<ProtectedRoute><RoomLobby /></ProtectedRoute>} />
                <Route path="/room/:code/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
                <Route path="/room/:code/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </div>
          </GameProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
