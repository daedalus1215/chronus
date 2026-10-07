import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useUpdateUsername } from '../../hooks/useUpdateUsername';

export const ChangeUsernameForm: React.FC = () => {
  const { updateUsername, isUpdating, error } = useUpdateUsername();
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Validate username format
    if (newUsername.trim().length < 4 || newUsername.trim().length > 20) {
      setValidationError('Username must be between 4 and 20 characters');
      return;
    }

    if (!currentPassword) {
      setValidationError('Current password is required');
      return;
    }

    try {
      await updateUsername({
        newUsername: newUsername.trim(),
        currentPassword,
      });
      setSuccessMessage(
        'Username updated successfully. You will be redirected to login.'
      );
    } catch (err) {
      // Error is handled by the hook
      console.log('error should be handled by the hook! Error:', err);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Change Username</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Changing your username will require you to log in again with your new
          username.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-username">New Username</Label>
            <Input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              required
              disabled={isUpdating}
              minLength={4}
              maxLength={20}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="change-username-password">Current Password</Label>
            <Input
              id="change-username-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>
          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="border-green-600/50 text-green-700 dark:text-green-400">
              <AlertDescription className="text-green-700 dark:text-green-400">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Username'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
