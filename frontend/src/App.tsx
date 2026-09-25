import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { SidebarProvider } from './contexts/SidebarContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { NotePage } from './pages/NotePage/NotePage';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useMemo } from 'react';
import type { FC } from 'react';
import {
  ThemeModeProvider,
  useThemeMode,
} from './contexts/ThemeModeContext';
import { createChronusTheme } from './theme';
import { TagPage } from './pages/TagPage/TagPage';
import { ActivityPage } from './pages/ActivityPage/ActivityPage';
import { YearlyNotesPage } from './pages/YearlyNotesPage/YearlyNotesPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage/KanbanBoardPage';
import { SearchPage } from './pages/SearchPage/SearchPage';
import { ExplorerPage } from './pages/ExplorerPage/ExplorerPage';
import { TimeEntryPage } from './pages/TimeEntryPage/TimeEntryPage';
import { ROUTES, ROUTE_PATTERNS } from './constants/routes';
import { AuthenticatedLayout } from './components/Layout/AuthenticatedLayout';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer/PersistentAudioPlayer';

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

          <Route path={ROUTE_PATTERNS.KANBAN} element={<KanbanBoardPage />} />

          {/* Other routes */}
          <Route path={ROUTES.TAGS} element={<TagPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityPage />} />
          <Route path={ROUTES.YEARLY_NOTES} element={<YearlyNotesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.EXPLORER} element={<ExplorerPage />}>
            <Route path={ROUTE_PATTERNS.NOTE} element={<NotePage />} />
          </Route>
          <Route path={ROUTES.TIME_ENTRY} element={<TimeEntryPage />} />

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

const ThemedShell: FC = () => {
  const { effectiveMode } = useThemeMode();
  const theme = useMemo(() => createChronusTheme(effectiveMode), [
    effectiveMode,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <SidebarProvider>
          <AudioPlayerProvider>
            <AppRoutes />
            <PersistentAudioPlayer />
          </AudioPlayerProvider>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <ThemedShell />
      </ThemeModeProvider>
    </AuthProvider>
  );
}
