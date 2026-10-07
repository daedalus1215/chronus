import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../auth/useAuth';
import { ChangeUsernameForm } from './components/ChangeUsernameForm/ChangeUsernameForm';
import { ChangePasswordForm } from './components/ChangePasswordForm/ChangePasswordForm';
import { AppearanceSettings } from './components/AppearanceSettings/AppearanceSettings';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="h-full overflow-y-scroll overflow-x-hidden">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-12">
        <h1 className="mb-2 text-3xl font-semibold">Settings</h1>
        <p className="mb-8 text-base text-muted-foreground">
          Manage your settings. Choose an appearance, update your username,
          or change your password.
        </p>
        <div className="pb-8">
          <AppearanceSettings />
        </div>
        <div className="pb-8">
          <ChangeUsernameForm />
          <ChangePasswordForm />
        </div>
        <div className="border-t border-border pb-16 pt-4">
          <Button variant="outline" onClick={() => logout()} aria-label="Sign out">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
