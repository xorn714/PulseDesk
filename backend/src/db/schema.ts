import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// =========================================================
// TIPOS ENUMERADOS (ENUMS)
// =========================================================
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "OPERATOR", "VIEWER"]);
export const httpMethodEnum = pgEnum("http_method", ["GET", "POST", "HEAD"]);
export const monitorStatusEnum = pgEnum("monitor_status", [
  "UP",
  "DOWN",
  "DEGRADED",
  "PAUSED",
]);
export const heartbeatStatusEnum = pgEnum("heartbeat_status", ["UP", "DOWN"]);
export const incidentSeverityEnum = pgEnum("incident_severity", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);
export const incidentStatusEnum = pgEnum("incident_status", [
  "INVESTIGATING",
  "IDENTIFIED",
  "MONITORING",
  "RESOLVED",
]);

// =========================================================
// 1. TABLA: USERS
// =========================================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("OPERATOR"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// 2. TABLA: MONITORS
// =========================================================
export const monitors = pgTable(
  "monitors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    url: text("url").notNull(),
    method: httpMethodEnum("method").notNull().default("GET"),
    intervalSeconds: integer("interval_seconds").notNull().default(60),
    expectedStatusCode: integer("expected_status_code").notNull().default(200),
    responseTimeThresholdMs: integer("response_time_threshold_ms")
      .notNull()
      .default(1500),
    status: monitorStatusEnum("status").notNull().default("PAUSED"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_monitors_user_id").on(table.userId)]
);

// =========================================================
// 3. TABLA: HEARTBEATS (Métricas de Pings)
// =========================================================
export const heartbeats = pgTable(
  "heartbeats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    monitorId: uuid("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    statusCode: integer("status_code"),
    latencyMs: integer("latency_ms").notNull(),
    status: heartbeatStatusEnum("status").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_heartbeats_monitor_created").on(
      table.monitorId,
      table.createdAt.desc()
    ),
  ]
);

// =========================================================
// 4. TABLA: INCIDENTS
// =========================================================
export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    monitorId: uuid("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    severity: incidentSeverityEnum("severity").notNull().default("MEDIUM"),
    status: incidentStatusEnum("status").notNull().default("INVESTIGATING"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_incidents_monitor_status").on(table.monitorId, table.status)]
);

// =========================================================
// 5. TABLA: INCIDENT_UPDATES (Timeline / Comentarios)
// =========================================================
export const incidentUpdates = pgTable(
  "incident_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incidentId: uuid("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    message: text("message").notNull(),
    status: incidentStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_incident_updates_incident_created").on(
      table.incidentId,
      table.createdAt.asc()
    ),
  ]
);
