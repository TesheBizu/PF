# Full Stack MERN Portfolio

A professional full-stack portfolio built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

The project is split into **two frontends** sharing one backend API:

| App | Folder | Purpose |
|-----|--------|---------|
| **Portfolio** | `Frontend/` | Public site (home, projects, contact) |
| **Admin** | `Admin/` | Admin dashboard (login, CRUD) |
| **API** | `backend/` | Shared Express + MongoDB API |

---

## Features

- Dark / Light theme toggle with localStorage persistence
- Animated spider-web canvas background (mouse-reactive)
- JWT authentication for admin dashboard
- Contact form saved to MongoDB, viewable in admin inbox
- Fully responsive — mobile, tablet, desktop

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Portfolio & Admin | React, Redux Toolkit, React Router, Axios, Vite |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MongoDB Atlas, Mongoose |
| Styling | Vanilla CSS + CSS Variables |

---

## Local development

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure environment

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in values.

**Admin** — copy `Admin/.env.example` to `Admin/.env`:

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

### 3. Run (3 terminals)

| Terminal | Command | URL |
|----------|---------|-----|
| Backend | `npm run dev:backend` | `http://localhost:5000` |
| Portfolio | `npm run dev:public` | `http://localhost:5173` |
| Admin | `npm run dev:admin` | `http://localhost:5174` |

Or run backend + portfolio together:

```bash
npm run dev
```

### 4. Seed database (first time)

```bash
npm run seed
```

---

## Deployment

### Backend (Render)

1. Deploy `backend/` as a Web Service
2. Set environment variables including:

```env
CLIENT_URL=https://your-portfolio.vercel.app,https://your-admin.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
```

Use comma-separated origins with **no trailing slashes**.

### Portfolio (Vercel — existing project)

- **Root Directory:** `Frontend`
- **Build:** `npm run build`
- **Output:** `dist`
- Uses `Frontend/vercel.json` to proxy `/api` to Render

### Admin (Vercel — new project)

1. Import the same GitHub repo
2. **Root Directory:** `Admin`
3. **Build:** `npm run build` | **Output:** `dist`
4. Environment variables:

```env
VITE_API_URL=https://your-api.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PUBLIC_SITE_URL=https://your-portfolio.vercel.app
```

5. Add admin URL to Google OAuth **Authorized JavaScript origins**

---

## API Endpoints

| Method | Route | Access |
|--------|-------|--------|
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/google-login` | Public |
| `POST` | `/api/auth/refresh` | Public |
| `GET` | `/api/projects` | Public |
| `POST` | `/api/projects` | Admin (JWT) |
| `GET` | `/api/skills` | Public |
| `POST` | `/api/skills` | Admin (JWT) |
| `GET` | `/api/experiences` | Public |
| `POST` | `/api/experiences` | Admin (JWT) |
| `POST` | `/api/messages` | Public |
| `GET` | `/api/messages` | Admin (JWT) |
| `POST` | `/api/upload` | Admin (JWT) |

---

## License

MIT © 2026 Teshome Bizuayehu
