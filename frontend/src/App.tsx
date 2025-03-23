import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { HomePage } from "./pages/HomePage/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { Layout } from "./components/Layout/Layout";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();
  console.log('App render - isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
