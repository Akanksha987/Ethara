# Ethara Project Tracker

A full-stack project and task management application built with a **Node.js/Express** backend and a **React** frontend. It supports role-based access control, JWT authentication, project membership management, and a task dashboard with overdue tracking.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Projects](#projects)
  - [Tasks](#tasks)
  - [Dashboard](#dashboard)
- [Role-Based Access Control](#role-based-access-control)
- [Data Models](#data-models)
- [Scripts](#scripts)

---

## Features

- **JWT Authentication** — Secure signup and login with 8-hour token expiry
- **Role-Based Access Control** — First registered user becomes Admin; subsequent users become Members
- **Project Management** — Admins can create, update, and manage project membership
- **Task Management** — Create tasks with assignees, due dates, and status tracking (`TODO`, `IN_PROGRESS`, `DONE`)
- **Dashboard** — Aggregated view of tasks with overdue detection and status summary
- **Security** — Helmet, CORS, bcrypt password hashing
- **Request Logging** — Morgan logger with daily rotating log files

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Express | HTTP server & routing |
| MongoDB (Driver v3) | Database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| helmet | HTTP security headers |
| cors | Cross-origin resource sharing |
| morgan | Request logging |
| rotating-file-stream | Daily log rotation |
| module-alias | Clean `@root`, `@models`, etc. imports |

### Frontend
| Package | Purpose |
|---|---|
| React 18 | UI framework |
| Create React App | Build toolchain |
| Fetch API | HTTP requests to backend |

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /api/auth/signup, /login
│   │   │   ├── user.js            # User CRUD
│   │   │   ├── projects.js        # Project CRUD + member management
│   │   │   ├── tasks.js           # Task CRUD + dashboard
│   │   │   └── router.js          # Combines all routes
│   │   ├── controllers/
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── project.js
│   │   │   └── task.js
│   │   ├── models/
│   │   │   ├── database.js        # MongoDB singleton connection
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   └── tasks.js
│   │   └── util/
│   │       ├── auth.js            # JWT helpers + middleware
│   │       └── logger.js          # Morgan setup
│   ├── package.json
│   └── .env                       # (you create this)
│
└── frontend/
    ├── src/
    │   ├── App.js                 # Main component (auth + dashboard)
    │   ├── App.css                # Styles
    │   ├── api.js                 # Fetch wrappers (get, post, put)
    │   └── index.js               # React root
    ├── public/
    │   └── index.html
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js **≥ 14**
- A running **MongoDB** instance (local or Atlas)
- npm

---

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm run setup

# 3. Create your .env file
cp .env.example .env   # or create manually (see Environment Variables)

# 4. Start the server
npm start
```

The server listens on the port specified in `.env` (default `3000`).

---

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. (Optional) Set the API URL if your backend is not on port 5000
# Create a .env file:
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# 4. Start the dev server
npm start
```

The React app opens at [http://localhost:3000](http://localhost:3000) (or the next available port).

> **Note:** If both servers run locally, make sure they are on different ports. The backend defaults to the port in its `.env`; the frontend dev server defaults to port 3000. Set `PORT=5000` in the backend `.env` to avoid conflicts.

---

## Environment Variables

Create a file at `backend/.env`:

```env
DB_URL=mongodb://localhost:27017/ethara   # Your MongoDB connection string
PORT=5000                                  # Port for the Express server
SECRET=your_super_secret_jwt_key           # Secret for signing JWTs
```

| Variable | Required | Description |
|---|---|---|
| `DB_URL` | ✅ | MongoDB connection URI |
| `PORT` | ✅ | Port the Express server listens on |
| `SECRET` | ✅ | JWT signing secret (keep this private!) |

For the frontend, create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## API Reference

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive a JWT |

**Signup body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```
> The **first** user to sign up is automatically assigned the `Admin` role. All subsequent users are `Member`.

**Login body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response (both):**
```json
{
  "status": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Alice", "email": "...", "role": "Admin" }
  }
}
```

---

### Users

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/users/me` | ✅ | Any | Get current user profile |
| GET | `/api/users` | ✅ | Admin | List all users |
| GET | `/api/users/:id` | ✅ | Admin | Get user by ID |
| PUT | `/api/users` | ✅ | Any* | Update user (self only, or Admin) |
| DELETE | `/api/users/:id` | ✅ | Any* | Delete user (self only, or Admin) |

---

### Projects

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/projects` | ✅ | Admin | Create a project |
| GET | `/api/projects` | ✅ | Any | List accessible projects |
| GET | `/api/projects/:id` | ✅ | Any | Get project details |
| PUT | `/api/projects/:id` | ✅ | Admin | Update project |
| POST | `/api/projects/:id/members` | ✅ | Admin | Add a member |
| DELETE | `/api/projects/:id/members/:memberId` | ✅ | Admin | Remove a member |

**Create/Update project body:**
```json
{
  "name": "Website Redesign",
  "description": "Q3 redesign initiative"
}
```

**Add member body:**
```json
{ "memberId": "<user_id>" }
```

---

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/tasks` | ✅ | Create a task in a project |
| GET | `/api/tasks` | ✅ | List tasks (filtered by `?projectId=`) |
| GET | `/api/tasks/:id` | ✅ | Get task by ID |
| PUT | `/api/tasks/:id` | ✅ | Update a task |

**Create task body:**
```json
{
  "title": "Design mockups",
  "description": "Create Figma wireframes",
  "assigneeId": "<user_id>",
  "dueDate": "2025-12-31",
  "status": "TODO"
}
```

Valid statuses: `TODO` | `IN_PROGRESS` | `DONE`

> The `assigneeId` must be the project owner or a project member.

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | ✅ | Aggregated task summary + overdue list |

**Response:**
```json
{
  "status": true,
  "data": {
    "tasks": [...],
    "summary": { "TODO": 5, "IN_PROGRESS": 3, "DONE": 12 },
    "overdue": [...]
  }
}
```

---

## Role-Based Access Control

| Action | Member | Admin |
|---|---|---|
| Sign up / Login | ✅ | ✅ |
| View own profile | ✅ | ✅ |
| View all users | ❌ | ✅ |
| Create projects | ❌ | ✅ |
| View own/member projects | ✅ | ✅ (all) |
| Update projects | ❌ | ✅ |
| Add/remove project members | ❌ | ✅ |
| Create tasks (in own project) | ✅ | ✅ |
| Update tasks (assigned/project) | ✅ | ✅ |
| View dashboard | ✅ (scoped) | ✅ (all) |

---

## Data Models

### User
```
_id, name, email, passwordHash, role (Admin | Member)
```

### Project
```
_id, name, description, ownerId, members[], createdAt
```

### Task
```
_id, title, description, projectId, assigneeId,
status (TODO | IN_PROGRESS | DONE), dueDate, createdAt, updatedAt
```

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run setup` | Install and update all dependencies |
| `npm start` | Start the Express server |

### Frontend

| Command | Description |
|---|---|
| `npm start` | Start the React development server |
| `npm run build` | Create a production build |
| `npm test` | Run tests |

---

## License

UNLICENSED — internal use only.