import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import Navbar from './components/layout/Navbar';
import Cursor from './components/ui/Cursor';
import Home from './pages/Home';
import Debates from './pages/Debates';
import DebateView from './pages/DebateView';
import CreateDebate from './pages/CreateDebate';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const Protected = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <Cursor />
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/debates"  element={<Debates />} />
        <Route path="/debates/:id" element={<DebateView />} />
        <Route path="/create"   element={<Protected><CreateDebate /></Protected>} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
