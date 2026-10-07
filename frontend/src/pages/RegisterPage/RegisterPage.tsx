import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Register } from './components/Register';
import { useAuth } from '../../auth/useAuth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const handleRegister = async (username: string, password: string) => {
    try {
      const success = await register(username, password);
      if (success) {
        navigate('/login', { replace: true });
      }
      return success;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4">
      <div className="w-full">
        <Register onRegister={handleRegister} />
      </div>
    </div>
  );
};
