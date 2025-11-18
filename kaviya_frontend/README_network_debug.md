# Network Error Debug Notes (Frontend + Backend)

Frontend changes:
- CRA proxy added in package.json: "proxy": "http://localhost:3001"
- Axios baseURL now defaults to '/api' (same-origin). If you need a custom URL, set REACT_APP_API_BASE_URL to an absolute URL that also ends with '/api'.
- Added ApiHealthPage at /_health to test:
  - GET /api/health
  - POST /api/login (with sample credentials)

Backend expectations (FastAPI):
- Expose health endpoint at GET /api/health returning JSON: {"status": "ok"} with 200.
- Expose POST /api/login and return explicit status codes:
  - 200 with {"token":"..."} on success
  - 401 with {"error":"INVALID_CREDENTIALS"} on invalid login
  - 400/500 with {"error":"..."} on other failures
- Add CORS to allow frontend origin (when not using the proxy), for example:
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "https://<your-frontend-host>"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
- Temporary request logging around /api/login:
  - Log method, path, request ID, client IP, and response status
  - Do NOT log passwords or secrets

Notes:
- When frontend is served over HTTPS and backend is HTTP, use the dev proxy (same-origin path) to avoid mixed content. In production, terminate TLS in a reverse proxy and forward to backend over HTTP inside the network.
