import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectAnalysisPage from './pages/ProjectAnalysisPage';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />

            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:id" 
          element={
            <ProtectedRoute>
              <ProjectAnalysisPage />

            </ProtectedRoute>
          } 
        />

        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
  
}

export default App;