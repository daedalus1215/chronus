import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useUpdatePassword } from '../../hooks/useUpdatePassword';

export const ChangePasswordForm: React.FC = () => {
  const { updatePassword, isUpdating, error } = useUpdatePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Validate password format
    if (newPassword.length < 6 || newPassword.length > 50) {
      setValidationError('Password must be between 6 and 50 characters');
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setValidationError('New password and confirmation password do not match');
      return;
    }

    if (!currentPassword) {
      setValidationError('Current password is required');
      return;
    }

    try {
      await updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccessMessage('Password updated successfully.');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Error is handled by the hook
      console.log('error should be handled by the hook! Error: ', err);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Change Password</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your current password and choose a new password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              disabled={isUpdating}
              minLength={6}
              maxLength={50}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isUpdating}
              minLength={6}
              maxLength={50}
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
            {isUpdating ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
