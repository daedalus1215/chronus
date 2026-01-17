## Chronus Backend
* Written in NestJS

## Installation

```bash
$ npm install
```

## Configuration

1. Copy `.env.sample` to `.env`:
```bash
$ cp .env.sample .env
```

2. Update the `.env` file with your configuration:
   - **DATABASE**: SQLite database file path (default: `db.sqlite`)
   - **JWT_SECRET**: Secret key for JWT token signing (change in production!)
   - **JWT_EXPIRES_IN**: JWT token expiration (e.g., `7d`, `24h`)
   - **COOKIE_KEY**: Key for cookie encryption (change in production!)
   - **NODE_ENV**: Environment (`development`, `production`, `test`)
   - **SMTP_***: Email configuration for event reminders (see Email Reminders section)

### Email Reminders

The application supports email reminders for calendar events. To enable this feature:

1. Configure SMTP settings in your `.env` file
2. For Gmail:
   - Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
   - Set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`
3. User usernames must be valid email addresses to receive reminders
4. Reminders are sent via a cron job that runs every minute

## Running the app
```bash
$ npm run dev
```

The API will be available at `http://localhost:3000/api` (or the port specified in `PORT`).

## Features

### Account Management
- **Username Changes**: Users can update their username from the Settings page. Requires password confirmation and triggers re-authentication.
- **Password Changes**: Users can update their password from the Settings page. Requires current password and new password confirmation.

### Calendar Events
- Create, update, and delete calendar events
- Support for recurring events
- Email reminders for events (requires SMTP configuration)
- Reminder scheduling with customizable timing (15 min, 1 hour, 1 day before, or custom)

## Test

```bash
# unit tests
$ npm run test

# architecture/dependency tests
$ npm run test:architecture
```

