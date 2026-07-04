# Full Stack MERN Portfolio

A professional full-stack portfolio built with the **MERN stack** (MongoDB, Express.js, React, Node.js.

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


```
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

```
## License
MIT © 2026 Teshome Bizuayehu
