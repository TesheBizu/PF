# Teshome Bizuayehu — Full Stack MERN Portfolio

A professional full-stack portfolio built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

🔗 **Live** — coming soon  
👨‍💻 **Developer** — [Teshome Bizuayehu](https://github.com/TesheBizu)

---

## Features

- 🌗 **Dark / Light theme toggle** with localStorage persistence
- 🕸️ **Animated spider-web canvas** background (mouse-reactive)
- 🔐 **JWT Authentication** with silent refresh token rotation
- 📊 **Admin Dashboard** — manage projects, skills, and messages
- 📬 **Contact form** → saved to MongoDB, readable in admin inbox
- 📱 **Fully responsive** — mobile, tablet, desktop

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React, Redux Toolkit, React Router DOM, Axios, React Toastify |
| Backend   | Node.js, Express.js, JWT, bcrypt |
| Database  | MongoDB Atlas, Mongoose |
| Styling   | Vanilla CSS + CSS Variables |
| Bundler   | Vite |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/TesheBizu/PF.git
cd PF
npm run install-all
npm install  # installs concurrently at root
```

### 2. Configure Environment

```bash
cd backend
copy .env.example .env
# Edit .env with your MongoDB URI
```

> ⚠️ If your MongoDB password contains `%`, encode it as `%25` in the URI.

### 3. Seed the Database

```bash
npm run seed
```

This creates the admin user (`teshelin7@gmail.com` / `Admin@123`) and seeds your skills and projects.

### 4. Run Development

```bash
npm run dev
```

- **Frontend** → http://localhost:5173  
- **Backend API** → http://localhost:5000/api  
- **Admin** → http://localhost:5173/admin/login

---

## API Endpoints

| Method | Route | Access |
|--------|-------|--------|
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Public |
| `GET`  | `/api/projects` | Public |
| `POST` | `/api/projects` | Admin |
| `GET`  | `/api/skills` | Public |
| `POST` | `/api/skills` | Admin |
| `POST` | `/api/messages` | Public |
| `GET`  | `/api/messages` | Admin |

---

## Project Structure

```
PF/
├── backend/          # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/         # React SPA
    └── src/
        ├── components/
        ├── pages/
        ├── redux/
        ├── services/
        └── styles/
```

---

## License

MIT © 2024 Teshome Bizuayehu