# ⚡ PulseDesk — Real-Time Service Monitoring & Incident Management

**PulseDesk** es una plataforma integral diseñada para el monitoreo de disponibilidad de servicios web, visualización de métricas de latencia en tiempo real y gestión colaborativa de incidentes técnicos.

El proyecto está construido bajo una arquitectura desacoplada y escalable de punta a punta, implementando **Arquitectura Hexagonal (Puertos y Adaptadores)** en el backend y una estructura **Feature-Based** en el frontend.

---

### ✨ Características Principales
* ⏱️ **Monitoreo Automatizado:** Ejecución periódica de comprobaciones de estado (*health-checks*) vía cron jobs asíncronos.
* 📊 **Métricas en Tiempo Real:** Visualización histórica de latencia y porcentaje de *uptime* con gráficos interactivos.
* 🚨 **Gestión de Incidentes:** Tablero para seguimiento de incidentes técnicos desde la detección hasta la resolución.
* 🔄 **Sincronización en Vivo:** Actualización instantánea de estados y alertas mediante WebSockets.

---

### 🛠️ Stack Tecnológico

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts / Tremor.
* **Backend:** Node.js, Express, TypeScript, WebSockets (`ws` / `socket.io`), Node-Cron.
* **Base de Datos & Persistencia:** PostgreSQL, Prisma / Drizzle ORM.
* **Patrones & Arquitectura:** Arquitectura Hexagonal (Domain, Application, Infrastructure) + Feature-Driven UI.