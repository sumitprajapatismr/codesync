import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import CollaborationRoom from './pages/CollaborationRoom';
import ProfilePage from './pages/ProfilePage';
import ContestPage from './pages/ContestPage';
import InterviewModePage from './pages/InterviewModePage';

// Layout helper to hide Navbar/Footer in workspace room
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith('/room/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isRoomPage && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isRoomPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <LayoutWrapper>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms/create"
                  element={
                    <ProtectedRoute>
                      <CreateRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms/join"
                  element={
                    <ProtectedRoute>
                      <JoinRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room/:roomId"
                  element={
                    <ProtectedRoute>
                      <CollaborationRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contests"
                  element={
                    <ProtectedRoute>
                      <ContestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewModePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </LayoutWrapper>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
