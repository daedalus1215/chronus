## Chronus Frontend
* Written in React with TypeScript and Material-UI

## Installation

```bash
$ npm install
```

## Configuration

1. Copy `vite.env.config.ts.sample` to `vite.env.config.ts`:
```bash
$ cp vite.env.config.ts.sample vite.env.config.ts
```

2. Update `vite.env.config.ts` with your configuration:
```typescript
export const env = {
    VITE_API_URL: 'http://localhost:3000',  // Backend API URL
    VITE_PORT: '5173',                      // Frontend dev server port
    VITE_HOST: '0.0.0.0',
    VITE_BASE_URL: '/',
    VITE_ALLOWED_HOSTS: 'localhost'
}
```

## Running the app
```bash
$ npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port specified in `VITE_PORT`).

## Features

### Account Settings
- **Change Username**: Update your username from the Settings page (accessible via sidebar)
  - Requires current password confirmation
  - Triggers re-authentication (you'll need to log in again with your new username)
- **Change Password**: Update your password from the Settings page
  - Requires current password verification
  - Requires new password confirmation

### Calendar
- View calendar events in a monthly/weekly view
- Create, edit, and delete events
- Support for recurring events
- Set email reminders for events (15 min, 1 hour, 1 day before, or custom time)
  - Reminders are sent to your username email address
  - Requires backend SMTP configuration

### Notes & Tags
- Create and manage notes (memos and checklists)
- Organize notes with tags
- Track time spent on notes

## Development

The frontend connects to the backend API at the URL specified in `VITE_API_URL`. Make sure the backend is running before starting the frontend.