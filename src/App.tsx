import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { HomePage } from "./pages/HomePage/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { ProtectedRoute } from "./router/ProtectedRoute";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();
  console.log('App render - isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
