import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { useAuth } from '../../auth/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    console.log('Attempting login...');
    const success = await login(username, password);
    console.log('Login success:', success);
    if (success) {
      console.log('Navigating to home...');
      navigate('/', { replace: true });
    }
    return success;
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <h1>Welcome to Chronus</h1>
      <Login onLogin={handleLogin} />
    </div>
  );
}; 