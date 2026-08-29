-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- TIPOS ENUMERADOS (ENUMS)
-- =========================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');
CREATE TYPE http_method AS ENUM ('GET', 'POST', 'HEAD');
CREATE TYPE monitor_status AS ENUM ('UP', 'DOWN', 'DEGRADED', 'PAUSED');
CREATE TYPE heartbeat_status AS ENUM ('UP', 'DOWN');
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE incident_status AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');

-- =========================================================
-- 1. TABLA: USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'OPERATOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. TABLA: MONITORS
-- =========================================================
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    url TEXT NOT NULL,
    method http_method NOT NULL DEFAULT 'GET',
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    expected_status_code INTEGER NOT NULL DEFAULT 200,
    response_time_threshold_ms INTEGER NOT NULL DEFAULT 1500,
    status monitor_status NOT NULL DEFAULT 'PAUSED',
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. TABLA: HEARTBEATS (Métricas de Pings)
-- =========================================================
CREATE TABLE IF NOT EXISTS heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status_code INTEGER,
    latency_ms INTEGER NOT NULL,
    status heartbeat_status NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. TABLA: INCIDENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'MEDIUM',
    status incident_status NOT NULL DEFAULT 'INVESTIGATING',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 5. TABLA: INCIDENT_UPDATES (Timeline / Comentarios)
-- =========================================================
CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    status incident_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- ÍNDICES ESTRATÉGICOS (Rendimiento)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_monitor_created ON heartbeats(monitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_monitor_status ON incidents(monitor_id, status);
CREATE INDEX IF NOT EXISTS idx_incident_updates_incident_created ON incident_updates(incident_id, created_at ASC);