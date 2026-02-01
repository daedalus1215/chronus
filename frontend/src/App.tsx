import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { SidebarProvider } from './contexts/SidebarContext';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { NotePage } from './pages/NotePage/NotePage';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { muiTheme } from './theme';
import { TagPage } from './pages/TagPage/TagPage';
import { ActivityPage } from './pages/ActivityPage/ActivityPage';
import { CalendarPage } from './pages/CalendarPage/CalendarPage';
import { YearlyNotesPage } from './pages/YearlyNotesPage/YearlyNotesPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { ROUTES, ROUTE_PATTERNS } from './constants/routes';
import { AuthenticatedLayout } from './components/Layout/AuthenticatedLayout';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          {/* Home route with optional note */}
          <Route path={ROUTES.HOME} element={<HomePage />}>
            <Route path={ROUTE_PATTERNS.NOTE} element={<NotePage />} />
          </Route>

          {/* Memos route with optional note */}
          <Route path={ROUTES.MEMOS} element={<HomePage />}>
            <Route path={ROUTE_PATTERNS.NOTE} element={<NotePage />} />
          </Route>

          {/* Checklists route with optional note */}
          <Route path={ROUTES.CHECKLISTS} element={<HomePage />}>
            <Route path={ROUTE_PATTERNS.NOTE} element={<NotePage />} />
          </Route>

          {/* Tag notes route: tree on left, note opens in right panel (TagPage) */}
          <Route path={ROUTE_PATTERNS.TAG_NOTES} element={<TagPage />}>
            <Route path={ROUTE_PATTERNS.NOTE} element={<NotePage />} />
          </Route>

          {/* Other routes */}
          <Route path={ROUTES.TAGS} element={<TagPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityPage />} />
          <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
          <Route path={ROUTES.YEARLY_NOTES} element={<YearlyNotesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          {/* Redirect authenticated users trying to access auth pages */}
          <Route
            path={ROUTES.LOGIN}
            element={<Navigate to={ROUTES.HOME} replace />}
          />
          <Route
            path={ROUTES.REGISTER}
            element={<Navigate to={ROUTES.HOME} replace />}
          />

          {/* Catch all other routes and redirect to home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path={ROUTES.LANDING} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      {/* Redirect unauthenticated users trying to access protected pages */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Router>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
