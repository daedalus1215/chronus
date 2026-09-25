import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useAuth } from '../../auth/useAuth';
import { ChangeUsernameForm } from './components/ChangeUsernameForm/ChangeUsernameForm';
import { ChangePasswordForm } from './components/ChangePasswordForm/ChangePasswordForm';
import { AppearanceSettings } from './components/AppearanceSettings/AppearanceSettings';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth="md" sx={{ py: 4, pb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your settings. Choose an appearance, update your username,
          or change your password.
        </Typography>
        <Box sx={{ pb: 4 }}>
          <AppearanceSettings />
        </Box>
        <Box sx={{ pb: 4 }}>
          <ChangeUsernameForm />
          <ChangePasswordForm />
        </Box>
        <Box sx={{ pt: 2, pb: 8, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => logout()}
            aria-label="Sign out"
          >
            Sign out
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
