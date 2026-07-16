# Mini ERP System

A full-stack Mini ERP application built for the NexAltis Technologies
"Full Stack Developer Internship" technical assessment. **Node.js / Express /
PostgreSQL** backend with JWT authentication and dynamic Role-Based Access
Control (RBAC), and a **React (Vite)** frontend with a sidebar that changes
per role.

## Feature checklist 

- **Authentication**: Login, Logout, JWT-based auth, protected APIs, role-based authorization.
- **Dashboard**: welcome message, logged-in user details, user role, current session status, today's working hours.
- **Session Tracking**: Start Session / End Session, current session status, session history, total working hours calculation (separate from login sessions — see "Two kinds of sessions" below).
- **Dynamic RBAC sidebar**: four roles — `admin`, `sales`, `hr`, `engineering` — each see only their own modules. Enforced both in the UI (sidebar + route guard) and, authoritatively, on every backend endpoint.
- **Domain entities**: Leads, Prospects, Meetings (Sales) · Job Announcements, Job Applications, Candidates (HR) · Projects, Tasks (Engineering).
- **Database**: normalized relational schema — Users, Roles, Departments, Permissions, Sessions, Leads, Prospects, Meetings, Job Announcements, Job Applications, Candidates, Projects, Tasks.

## Two kinds of "sessions" (important design note)

The spec asks for two different things that both use the word "session":

1. **Login sessions** (`user_sessions` table) — created automatically when a
   user logs in, tied to the JWT's `jti`. Used purely for **auth revocation**:
   logging out (or an admin revoking access) invalidates the token
   server-side, even before it naturally expires.
2. **Work sessions** (`work_sessions` table) — created **explicitly** by the
   user via Start Session / End Session buttons on the "Session Tracking"
   page. This is what "today's working hours" and "session history" in the
   spec refer to. A user can be logged in without being clocked in.

Keeping these separate avoids conflating "is this token still valid" with
"is the employee clocked in right now" — they're different concerns with
different lifecycles.

## Project structure

```
mini-erp/
├── db/
│   └── schema.sql            # Full schema + seed data (roles, permissions, departments)
├── backend/
│   └── src/
│       ├── app.js / server.js
│       ├── config/db.js          # PostgreSQL pool
│       ├── utils/                # jwt, hash, asyncHandler, response envelope, AppError
│       ├── middleware/           # auth (JWT + session check), rbac, validate, errorHandler
│       ├── core/                 # generic CRUD factory + router builder (repository/service/controller)
│       ├── routes/               # auth, users, roles, departments, sessions,
│       │                         # leads, prospects, meetings,
│       │                         # jobAnnouncements, jobApplications, candidates,
│       │                         # projects, tasks
│       └── scripts/seed.js       # creates one demo user per role
└── frontend/
    └── src/
        ├── api/client.js          # axios instance with JWT interceptor
        ├── context/AuthContext.jsx
        ├── config/navConfig.js    # role -> sidebar items mapping (drives dynamic sidebar)
        ├── components/            # Layout, PrivateRoute, RoleRoute
        └── pages/                 # Login, Dashboard, Sessions, Leads, Prospects, Meetings,
                                    # JobAnnouncements, JobApplications, Candidates,
                                    # Projects, Tasks, UsersAdmin, RolesAdmin, DepartmentsAdmin,
                                    # GenericModulePage (shared CRUD UI)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 13+

## Setup

### 1. Database

```bash
createdb mini_erp
psql -U postgres -d mini_erp -f db/schema.sql
```

This creates all tables and seeds: 4 roles (`admin`, `sales`, `hr`,
`engineering`) with their permissions, 3 departments (Sales, Human
Resources, Engineering).

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env with your PostgreSQL credentials and a real JWT_SECRET

npm install
npm run seed     # creates one demo user per role (see credentials below)
npm run dev      # starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

### 4. Sample login credentials

All demo accounts share the password **`Password@123`**:

| Email | Role | Sidebar modules |
|---|---|---|
| admin@example.com | admin | Users, Roles, Departments |
| sales@example.com | sales | Leads, Prospects, Meetings |
| hr@example.com | hr | Job Announcements, Applications, Candidates |
| engineering@example.com | engineering | Projects, Tasks |

Every role also has Dashboard and Session Tracking. Log in as different
roles to see the sidebar change automatically.

## API overview

All responses use a consistent envelope: `{ success, data, error, meta }`.

| Method | Path | Description | Required permission |
|---|---|---|---|
| POST | /api/auth/login | Login, returns JWT | — |
| POST | /api/auth/logout | Invalidate current login session | authenticated |
| GET | /api/auth/me | Current user + permissions | authenticated |
| POST | /api/sessions/start | Clock in (start work session) | authenticated |
| POST | /api/sessions/end | Clock out (end work session, computes duration) | authenticated |
| GET | /api/sessions/current | Current status + today's working hours | authenticated |
| GET | /api/sessions/history | Work session history | authenticated |
| CRUD | /api/users, /api/roles, /api/departments | Admin management | users/roles/departments \*:read/write |
| CRUD | /api/leads, /api/prospects, /api/meetings | Sales module | leads/prospects/meetings \*:read/write |
| CRUD | /api/job-announcements, /api/job-applications, /api/candidates | HR module | job_announcements/job_applications/candidates \*:read/write |
| CRUD | /api/projects, /api/tasks | Engineering module | projects/tasks \*:read/write |

## Design decisions & trade-offs (for the review discussion)

- **Generic CRUD factory** (`backend/src/core/factory.js` +
  `buildCrudRouter.js`): repository → service → controller are built once,
  generically, and every domain module (leads, prospects, meetings, etc.) is
  a ~10-line config file. This trades a small amount of flexibility (no
  per-module custom SQL without dropping to a hand-written route) for a lot
  of consistency and much less repetition across 8 structurally-identical
  modules. The `users` module opts out of the factory because it needs
  password hashing and joined role/department names.
- **Backend folder layout** deviates slightly from the suggested
  `controllers/ services/ repositories/ models/` split — those three layers
  are combined into `core/factory.js` since, for these modules, they really
  are one generic implementation parameterized by table name. This was a
  deliberate simplification for a 48-hour assessment; a larger app would
  likely split them out once modules diverge from the generic pattern.
- **RBAC is enforced twice**: once in the frontend (dynamic sidebar +
  `RoleRoute` route guards) for UX, and independently in the backend
  (`requirePermission` middleware on every route) as the actual security
  boundary. The frontend check is convenience only — it can be bypassed by
  calling the API directly, which is exactly why the backend check exists
  and is non-negotiable.
- **Login sessions vs. work sessions** are modeled as two separate tables
  (see above) rather than overloading one `sessions` table, to keep auth
  revocation and time-tracking independent.
- **Passwords** are hashed with `bcryptjs` (10 salt rounds); plaintext
  passwords are never stored or logged.
- **Session invalidation** is enforced at the database level: the
  `authenticate` middleware checks that the JWT's `jti` still has an active
  row in `user_sessions`, so logging out truly revokes the token rather
  than relying on client-side token deletion alone.

## Assumptions

- The assessment's suggested entities (Leads, Prospects, Meetings, Job
  Announcements, Job Applications, Candidates, Projects, Tasks) were
  implemented as described; `owner_id` / `assignee_id` columns link records
  back to `users` where relevant.
- "Today's working hours" sums all completed work sessions that started
  today, plus the live elapsed time of a currently-active session.
- Self-registration (`POST /api/auth/register`) defaults new accounts to the
  `sales` role if none is specified; in practice, admins create accounts via
  the Users admin page instead.
