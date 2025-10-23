import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AIPledgeAssistant from './components/AIPledgeAssistant';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DevLoginPage from './pages/DevLoginPage';
import Dashboard from './pages/Dashboard';
import PledgePage from './pages/PledgePage';
import FeedbackPage from './pages/FeedbackPage';
import CertificatePage from './pages/CertificatePage';
import DailyCheckInPage from './pages/DailyCheckInPage';
import FirebaseTestPage from './pages/FirebaseTestPage';
import './App.css';

const queryClient = new QueryClient();

// Function removed to avoid duplication with App

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen w-full bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dev-login" element={<DevLoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pledge"
                element={
                  <ProtectedRoute>
                    <PledgePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <FeedbackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificate"
                element={
                  <ProtectedRoute>
                    <CertificatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkin"
                element={
                  <ProtectedRoute>
                    <DailyCheckInPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/firebase-test" element={<FirebaseTestPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
