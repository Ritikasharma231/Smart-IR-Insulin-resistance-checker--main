# Patient database (SQLite)

Patient accounts and assessments are stored in **SQLite** at `server/data/smartir.db`.

## Run the full stack

**Terminal 1 — patient database API (port 3001):**
```bash
npm run server
```

**Terminal 2 — ML predictions API (port 8000):**
```bash
cd insulin_resistance_prediction-main
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 3 — React app (port 3000):**
```bash
npm start
```

Or run database + frontend together:
```bash
npm run dev
```
(Still start the ML API separately for live predictions.)

## Admin access

Admin credentials are **not** built into the app. Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (local) or your secrets manager (production). See [ADMIN_SECURITY.md](./ADMIN_SECURITY.md).

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Database health |
| POST | `/api/auth/register` | Create patient account |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/assessments` | Current user's assessments |
| POST | `/api/assessments` | Save assessment JSON |
| GET | `/api/admin/patients` | Admin: list patients |
| GET | `/api/admin/stats` | Admin: dashboard stats |

The React app proxies `/api/*` to port 3001 via `src/setupProxy.js`.
