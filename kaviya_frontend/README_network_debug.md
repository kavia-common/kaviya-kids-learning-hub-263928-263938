# Network Debugging Notes (Frontend ↔ Backend)

This guide helps resolve common issues like "Invalid Host Header", mixed-content, and CORS when running the React frontend against the FastAPI backend during development or remote previews.

## Target Setup (Recommended)
- Frontend: CRA dev server on port 3000
- Backend: FastAPI on port 3001
- Proxy: CRA dev server proxies `/api/*` to the backend

### 1) Ensure CRA proxy is configured
In `kaviya_frontend/package.json`, confirm this entry exists:
  "proxy": "http://localhost:3001"

This allows the browser to call same-origin paths like `/api/...`, which the CRA dev server forwards to the backend, avoiding mixed-content and CORS.

### 2) Axios baseURL must be same-origin
Our Axios client is already configured to use a relative base:
  baseURL: "/api"

Do not change this to an absolute http:// URL when the page is served over HTTPS; that would cause mixed-content blocking. If you truly need a custom base, set REACT_APP_API_BASE_URL to an HTTPS origin that terminates TLS and routes to the backend.

### 3) Allow external hosts (fix "Invalid Host Header")
When accessing the dev server via a remote/preview host (e.g., beta.kavia.ai), CRA may block the request with "Invalid Host Header". For development only, create `.env.development.local` in `kaviya_frontend/` with:

HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true

This binds to all interfaces and bypasses host header checks so `beta.kavia.ai` works. If a custom CRA/webpack override is added later, prefer an explicit allowedHosts setting:
  allowedHosts: ['beta.kavia.ai']

### 4) HTTPS handling
- Keep CRA dev server over HTTP. Let the preview platform terminate HTTPS.
- Because Axios uses '/api', requests are same-origin to the dev server, which proxies to http://localhost:3001. The browser sees HTTPS→same-origin, so no mixed-content.

### 5) Restart required
After changing package.json or any .env files, restart the frontend dev server:
- Stop the running frontend on port 3000
- Start it again so it picks up the new proxy/host settings

### 6) Quick checklist
- [x] package.json has "proxy": "http://localhost:3001"
- [x] src/api/client.js uses baseURL "/api" (or REACT_APP_API_BASE_URL set to HTTPS origin)
- [x] .env.development.local includes:
      HOST=0.0.0.0
      DANGEROUSLY_DISABLE_HOST_CHECK=true
- [x] Frontend dev server restarted
- [x] Backend reachable on http://localhost:3001

### 7) Troubleshooting tips
- Still seeing "Invalid Host Header"?
  - Verify file name/location: kaviya_frontend/.env.development.local
  - Restart the dev server after changes
- Mixed-content warnings?
  - Ensure Axios baseURL is '/api' (relative) when page is HTTPS
- API calls failing?
  - Use browser DevTools Network tab to verify requests start with /api/ and get proxied
  - Check backend logs on port 3001
