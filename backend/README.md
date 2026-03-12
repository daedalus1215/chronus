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
   - **ALLOW_REGISTRATION**: Set to `false` to disable public registration (recommended for production single-user apps)
   - **FRONTEND_ORIGIN**: Comma-separated list of allowed CORS origins (omit to allow all; set in production for security)
   - **SMTP_***: Email configuration (SMTP host, port, user, pass, from address)

## Running the app
```bash
$ npm run dev
```

The API will be available at `http://localhost:3000/api` (or the port specified in `PORT`).

## Features

### Account Management
- **Username Changes**: Users can update their username from the Settings page. Requires password confirmation and triggers re-authentication.
- **Password Changes**: Users can update their password from the Settings page. Requires current password and new password confirmation.

## Test

```bash
# unit tests
$ npm run test

# architecture/dependency tests
$ npm run test:architecture
```

