-- =========================================================
-- Mini ERP System - PostgreSQL Schema (v2 - matches assessment spec)
-- =========================================================
-- Run with: psql -U <user> -d <database> -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- Core RBAC tables
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,        -- 'admin', 'sales', 'hr', 'engineering'
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(100) UNIQUE NOT NULL,       -- e.g. 'leads:read', 'projects:write'
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER NOT NULL REFERENCES roles(id),
    department_id INTEGER REFERENCES departments(id),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- Login sessions (JWT-backed, used for auth revocation)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id    VARCHAR(255),           -- jti of the issued JWT
    ip_address  VARCHAR(64),
    user_agent  VARCHAR(255),
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at    TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT true
);

-- ---------------------------------------------------------
-- Work sessions (explicit Start/End Session feature - clock in/out)
-- Separate from login sessions: a user can log in without clocking in.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_sessions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at         TIMESTAMPTZ,
    duration_minutes INTEGER,           -- computed when the session ends
    is_active        BOOLEAN NOT NULL DEFAULT true
);

-- ---------------------------------------------------------
-- Sales module entities
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150),
    phone         VARCHAR(30),
    source        VARCHAR(100),
    status        VARCHAR(30) NOT NULL DEFAULT 'new',  -- new, contacted, qualified, lost
    owner_id      INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospects (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    company       VARCHAR(150),
    stage         VARCHAR(30) NOT NULL DEFAULT 'evaluating', -- evaluating, negotiation, won, lost
    owner_id      INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meetings (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(150) NOT NULL,
    with_whom     VARCHAR(150),
    scheduled_at  TIMESTAMPTZ,
    status        VARCHAR(30) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
    owner_id      INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- HR module entities
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_announcements (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(150) NOT NULL,
    description   TEXT,
    department_id INTEGER REFERENCES departments(id),
    status        VARCHAR(30) NOT NULL DEFAULT 'open',  -- open, closed
    posted_by     INTEGER REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id                  SERIAL PRIMARY KEY,
    job_announcement_id INTEGER REFERENCES job_announcements(id) ON DELETE CASCADE,
    applicant_name      VARCHAR(150) NOT NULL,
    applicant_email     VARCHAR(150),
    status              VARCHAR(30) NOT NULL DEFAULT 'submitted', -- submitted, shortlisted, rejected, hired
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150),
    position      VARCHAR(100),
    status        VARCHAR(30) NOT NULL DEFAULT 'in_review', -- in_review, interviewing, offered, hired, rejected
    department_id INTEGER REFERENCES departments(id),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- Engineering module entities
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    description   TEXT,
    status        VARCHAR(30) NOT NULL DEFAULT 'planned', -- planned, in_progress, done
    owner_id      INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    due_date      DATE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id           SERIAL PRIMARY KEY,
    project_id   INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title        VARCHAR(150) NOT NULL,
    status       VARCHAR(30) NOT NULL DEFAULT 'todo', -- todo, in_progress, done
    priority     VARCHAR(20) NOT NULL DEFAULT 'medium',
    assignee_id  INTEGER REFERENCES users(id),
    due_date     DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_prospects_owner ON prospects(owner_id);
CREATE INDEX IF NOT EXISTS idx_meetings_owner ON meetings(owner_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_announcement ON job_applications(job_announcement_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);

-- ---------------------------------------------------------
-- Seed data: roles
-- ---------------------------------------------------------
INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access - manages users, roles, departments'),
    ('sales', 'Sales department - leads, prospects, meetings'),
    ('hr', 'Human Resources department - job announcements, applications, candidates'),
    ('engineering', 'Engineering department - projects, tasks')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------
-- Seed data: permissions
-- ---------------------------------------------------------
INSERT INTO permissions (code, description) VALUES
    ('users:read', 'View users'), ('users:write', 'Manage users'),
    ('roles:read', 'View roles'), ('roles:write', 'Manage roles'),
    ('departments:read', 'View departments'), ('departments:write', 'Manage departments'),
    ('sessions:read', 'View session history'),
    ('leads:read', 'View leads'), ('leads:write', 'Manage leads'),
    ('prospects:read', 'View prospects'), ('prospects:write', 'Manage prospects'),
    ('meetings:read', 'View meetings'), ('meetings:write', 'Manage meetings'),
    ('job_announcements:read', 'View job announcements'), ('job_announcements:write', 'Manage job announcements'),
    ('job_applications:read', 'View job applications'), ('job_applications:write', 'Manage job applications'),
    ('candidates:read', 'View candidates'), ('candidates:write', 'Manage candidates'),
    ('projects:read', 'View projects'), ('projects:write', 'Manage projects'),
    ('tasks:read', 'View tasks'), ('tasks:write', 'Manage tasks')
ON CONFLICT (code) DO NOTHING;

-- admin: everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- sales: leads, prospects, meetings (read+write), sessions:read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'sales'
  AND p.code IN ('sessions:read','leads:read','leads:write',
                 'prospects:read','prospects:write','meetings:read','meetings:write')
ON CONFLICT DO NOTHING;

-- hr: job announcements, job applications, candidates
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'hr'
  AND p.code IN ('sessions:read','job_announcements:read','job_announcements:write',
                 'job_applications:read','job_applications:write',
                 'candidates:read','candidates:write')
ON CONFLICT DO NOTHING;

-- engineering: projects, tasks
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'engineering'
  AND p.code IN ('sessions:read','projects:read','projects:write','tasks:read','tasks:write')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- Seed data: departments
-- ---------------------------------------------------------
INSERT INTO departments (name, description) VALUES
    ('Sales', 'Sales and business development'),
    ('Human Resources', 'People operations'),
    ('Engineering', 'Product and software engineering')
ON CONFLICT (name) DO NOTHING;

-- Default users are created by backend/src/scripts/seed.js (bcrypt hashing
-- needs to happen in Node, not raw SQL).
