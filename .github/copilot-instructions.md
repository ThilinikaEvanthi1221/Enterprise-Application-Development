## Copilot / AI contributor instructions (concise)

Purpose: Help an AI coding agent be productive in this repo by documenting architecture, run/build/debug flows, conventions, and concrete examples to change or extend the app safely.

1) Big picture (what touches what)
- Monorepo with two folders: `backend/` (Express + Mongoose API) and `frontend/` (React CRA).
- Backend entry: `backend/server.js` — connects MongoDB (`backend/config/db.js`), mounts routes under `/api` and specifically `app.use('/api/auth', require('./routes/authRoutes'))`.
- Frontend entry: `frontend/src/App.js` — React Router mounts `/login` and `/signup` pages which call `frontend/src/services/api.js`.

2) Key responsibilities and data flow
- UI (login/signup) -> axios calls to `http://localhost:5000/api/auth/*` (see `frontend/src/services/api.js`).
- Auth controller (`backend/controllers/authController.js`) handles signup/login, persists users in MongoDB (`backend/models/user.js`) and returns a JWT token on login. JWT is signed with `process.env.JWT_SECRET` and expires in 1h.
- Roles are in the user model enum: `"customer" | "employee"` and are returned in responses.

3) Environment and run/debug commands (how developers run this locally)
- Backend needs env vars: at least `MONGO_URI` and `JWT_SECRET` (optionally `PORT`). Place them in `backend/.env` (not committed).
- Backend run (PowerShell):
```powershell
cd backend
# $env:MONGO_URI='mongodb://...'; $env:JWT_SECRET='secret'; node server.js
# or use nodemon during development if installed: npx nodemon server.js
```
- Frontend run (PowerShell):
```powershell
cd frontend
npm install
npm start
```

Notes: backend/package.json currently lists dependencies (express, mongoose, bcryptjs, jsonwebtoken) and a devDependency `nodemon`. There is no `start` script in backend; use `node server.js` or add a script if you prefer `npm run start`.

4) Project-specific conventions and quick pointers
- API base URL: `frontend/src/services/api.js` creates axios instance with baseURL `http://localhost:5000/api` — changing backend port or deploy URL requires updating this file (or better: use an env var in frontend).
- Auth endpoints: defined in `backend/routes/authRoutes.js`:
  - POST `/api/auth/signup` -> `signup(req.body)`
  - POST `/api/auth/login` -> `login(req.body)`
- Token handling: frontend login stores the token in `localStorage` (`login.js`). There is an empty `backend/middleware/authMiddleware.js` file — expect auth checks to be added here when protecting routes.
- Passwords: hashed with `bcrypt.hash(..., 10)` in controller; comparison uses `bcrypt.compare`.

5) Files worth examining for changes or adding features
- Add protected backend routes -> implement `backend/middleware/authMiddleware.js` and import where needed.
- For DB ops see `backend/models/user.js` (Mongoose schema). Role logic is in the schema enum.
- To change session length or claims: edit `jwt.sign(..., { expiresIn: '1h' })` in `backend/controllers/authController.js`.

6) Examples (concrete snippets to follow or modify)
- If you add a protected route, pattern:
  - create middleware in `backend/middleware/authMiddleware.js` that verifies `Authorization: Bearer <token>` using `jsonwebtoken.verify(token, process.env.JWT_SECRET)` and sets `req.user = { id, role }`.
  - use it: `router.get('/private', authMiddleware, (req, res) => res.json({ msg: 'ok' }));`
- If you change the frontend base URL, update `frontend/src/services/api.js` (or replace with env var usage via `process.env.REACT_APP_API_URL`).

7) Testing and quality
- There are no automated tests in this repo. Frontend has CRA test deps in package.json but no test suites. Keep changes small and test manual flows (signup -> login -> token) first.

8) Quick debugging checklist (when something fails locally)
- Backend console shows `MongoDB Connected...` from `backend/config/db.js`.
- Common issues: missing `MONGO_URI` or `JWT_SECRET` env var; verify `server.js` uses `dotenv.config()`.
- If 404 from frontend API calls, confirm server is running on port 5000 and `frontend/src/services/api.js` baseURL matches.

9) When committing code changes
- Keep backend and frontend changes logically separated in commits (e.g., `backend: add auth middleware` / `frontend: read token from storage`).

10) Where to look for follow-ups or to extend
- Add route authorization in `backend/middleware/authMiddleware.js` (currently empty).
- Add backend npm scripts (start/dev) to `backend/package.json` for convenience.
- Replace hard-coded axios baseURL with an env-driven value in `frontend/src/services/api.js`.

If anything above is unclear or you'd like the file to include more examples (e.g., a ready-to-drop auth middleware implementation or a suggested backend `package.json` scripts block), tell me which areas to expand and I will iterate.
