# BizSocials Web

Vite/React frontend for the BizSocials dashboard.

## Environment

Create `.env` from `.env.example` and point the API domain to your backend:

```env
VITE_APP_DOMAIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## API Structure

All API calls should go through the centralized layers:

- `src/config/appConfig.js` stores the app domain and API base URL.
- `src/services/httpClient.js` wraps `fetch`, headers, JSON parsing, auth token support, and API errors.
- `src/repositories/apiEndpoints.js` stores endpoint paths.
- `src/repositories/authRepository.js` contains login/signup/profile/logout API calls.

Feature modules call repositories instead of calling `fetch` directly.

## Auth Flow

- `#/login` renders the login module.
- `#/signup` renders the signup module.
- `#/dashboard` is shown after a valid auth response is stored.
- Auth session state is centralized in `src/modules/auth/context/AuthContext.jsx`.
