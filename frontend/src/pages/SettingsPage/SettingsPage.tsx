import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { ChangeUsernameForm } from './components/ChangeUsernameForm/ChangeUsernameForm';
import { ChangePasswordForm } from './components/ChangePasswordForm/ChangePasswordForm';

export const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings. Update your username or change your password.
      </Typography>
      <Box>
        <ChangeUsernameForm />
        <ChangePasswordForm />
      </Box>
    </Container>
  );
};
