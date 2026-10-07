import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '../../../components/Logo/Logo';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm shadow-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-1 flex flex-col items-center gap-4">
            <Logo height={75} />
            <h1 className="text-3xl font-semibold">Login</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full rounded-full py-6 text-base font-semibold"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <p className="mt-1 text-center text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
