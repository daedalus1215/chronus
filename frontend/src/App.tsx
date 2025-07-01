import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { NotePage } from './pages/NotePage/NotePage';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { muiTheme } from './theme';
import { TagPage } from './pages/TagPage/TagPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memos" element={<HomePage />} />
          <Route path="/checklists" element={<HomePage />} />
          <Route path="/tag-notes/:tagId" element={<HomePage />} />
          <Route path="/tags" element={<TagPage />} />
          <Route path="/notes/:id" element={<NotePage />} />
          {/* Redirect authenticated users trying to access auth pages */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          {/* Catch all other routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Redirect unauthenticated users trying to access protected pages */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
