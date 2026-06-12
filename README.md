# 📡 TrackConnect

Real-time location sharing — send requests by phone number, accept connections, and track approved contacts live on a map.

---

## Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | HTML · CSS · Vanilla JS · Leaflet.js · Socket.IO Client |
| Backend   | Node.js · Express · Socket.IO · JWT · bcrypt    |
| Database  | MySQL                                           |
| Uploads   | Multer                                          |
| Security  | Helmet · express-rate-limit · express-validator |

---

## Setup

### 1. Prerequisites
- Node.js 18+
- MySQL 8+
- A browser (Chrome / Firefox recommended for Geolocation)

---

### 2. Database

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `trackconnect` database with tables: `users`, `contacts`, `requests`, `locations`.

---

### 3. Configure environment

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trackconnect
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://127.0.0.1:5500
```

---

### 4. Install dependencies

```bash
cd backend
npm install
```

---

### 5. Start the backend

```bash
npm run dev
```

Server runs at **http://const API_BASE = "https://3467-2401-4900-88eb-16c-4165-d666-48c3-2a2b.https://trackconnect.onrender.com-free.app/api"; "https://himself-finder-pace-placed.trycloudflare.com/api";"https://willow-sets-valium-subsequently.trycloudflare.com/api";**

---

### 6. Open the frontend

Open `frontend/index.html` with a local server (required for Geolocation):

**Option A — VS Code Live Server** (recommended)
Right-click `index.html` → *Open with Live Server*. Default URL: `http://127.0.0.1:5500`

**Option B — Python**
```bash
cd frontend
python3 -m http.server 5500
# Open http://localhost:5500
```

**Option C — npx serve**
```bash
cd frontend
npx serve -p 5500
```

> ⚠️ Opening `index.html` directly as a `file://` URL will block Geolocation in most browsers. Always use a local server.

---

## API Endpoints

| Method | Path                        | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | /api/auth/register          | –    | Register new user              |
| POST   | /api/auth/login             | –    | Login (email or phone)         |
| GET    | /api/auth/me                | ✅   | Get current user               |
| POST   | /api/auth/logout            | ✅   | Logout                         |
| GET    | /api/contacts               | ✅   | List accepted contacts         |
| POST   | /api/contacts/request       | ✅   | Send request by phone number   |
| DELETE | /api/contacts/:id           | ✅   | Remove a contact               |
| GET    | /api/requests/incoming      | ✅   | Pending incoming requests      |
| GET    | /api/requests/outgoing      | ✅   | All outgoing requests          |
| POST   | /api/requests/accept/:id    | ✅   | Accept a request               |
| POST   | /api/requests/reject/:id    | ✅   | Reject a request               |
| POST   | /api/location/update        | ✅   | Push your current coordinates  |
| GET    | /api/location/my            | ✅   | Get your stored location       |
| GET    | /api/location/:userId       | ✅   | Get a contact's location       |
| GET    | /api/profile                | ✅   | Full profile + stats           |
| PUT    | /api/profile                | ✅   | Update name                    |
| POST   | /api/profile/upload         | ✅   | Upload profile photo           |

---

## Socket.IO Events

| Event              | Direction       | Payload                                  |
|--------------------|-----------------|------------------------------------------|
| `registered`       | server → client | `{ userId }`                             |
| `location_update`  | client → server | `{ latitude, longitude, accuracy }`      |
| `location_update`  | server → client | `{ userId, latitude, longitude, … }`     |
| `new_request`      | server → client | `{ requestId, from: { id, name, phone }}`|
| `request_accepted` | server → client | `{ requestId, by: { id, name } }`        |
| `request_rejected` | server → client | `{ requestId, by: { id, name } }`        |

---

## Project Structure

```
TrackConnect/
├── frontend/
│   ├── index.html          ← Login / Register
│   ├── dashboard.html      ← Stats, location toggle, quick actions
│   ├── contacts.html       ← Add by phone, list, remove
│   ├── requests.html       ← Incoming / outgoing tabs
│   ├── tracking.html       ← Leaflet map + contact picker
│   ├── profile.html        ← Edit name, upload photo
│   ├── css/style.css       ← Global glassmorphism dark theme
│   └── js/
│       ├── api.js          ← apiFetch, Auth, Toast, helpers
│       ├── sidebar.js      ← Injects sidebar HTML
│       └── socket.js       ← SocketClient wrapper
│
└── backend/
    ├── server.js           ← Express + Socket.IO entry point
    ├── schema.sql          ← Full MySQL schema
    ├── .env                ← Environment variables
    ├── config/db.js        ← MySQL connection pool
    ├── utils/jwt.js        ← Token generate/verify
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── models/             ← DB query functions
    ├── controllers/        ← Request handlers
    └── routes/             ← Express routers
```

---

## Security Features

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens on every protected route
- **Helmet** sets secure HTTP headers
- **Rate limiting** — 200 req/15 min globally, 20/15 min on auth routes
- **express-validator** validates all inputs
- **Parameterised queries** via mysql2 prevent SQL injection
- **CORS** restricted to configured frontend origin
- Contact verification before any location is returned
