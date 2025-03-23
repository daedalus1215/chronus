import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import { Logo } from '../../../components/Logo/Logo';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}
 
export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch {
      setError('An error occurred during login');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>
          <Logo height={75} />
          <span>Login</span>
        </h2>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>Login</button>
      </form>
      <div className={styles.registerLink}>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}; 