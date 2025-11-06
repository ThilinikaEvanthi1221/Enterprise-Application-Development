AutoServicePro - Service Ratings Dashboard (MERN)

Getting Started

1) Backend (.env)

Create `backend/.env` with your provided credentials:

```
MONGO_URI=mongodb+srv://ewadanambi_db_user:QFQEKNS9pWPXcimP@ead.pk3etwe.mongodb.net/
DB_NAME=autoservicepro
PORT=5000
JWT_SECRET=supersecretkey
```

2) Install dependencies

```
cd backend && npm i
cd ../frontend && npm i
```

3) Seed demo data (optional)

```
cd backend
npm run seed
```

4) Run the apps

Open two terminals:

```
cd backend
npm run start
```

```
cd frontend
npm run dev
```

The frontend dev server proxies `/api` to `http://localhost:5000`.

Key Endpoints

- `GET /api/ratings` list ratings with query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `dateFrom`, `dateTo`, `minRating`, `maxRating`, `serviceType`.
- `GET /api/ratings/summary` aggregated KPIs and breakdown for the dashboard.
- `POST /api/ratings/seed` seed random demo data (also available via `npm run seed`).

Client

- Built with Vite + React.
- Uses Recharts for the ratings breakdown, with KPI cards and a paginated searchable table.


