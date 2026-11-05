<div align="center">

# 🏋️ GymSync
### *Smart Gym Operations & Membership Ecosystem*

![Version](https://img.shields.io/badge/version-1.0.0-coral?style=flat-square)
![Node](https://img.shields.io/badge/node-20+-green?style=flat-square)
![Angular](https://img.shields.io/badge/angular-17+-red?style=flat-square)
![MySQL](https://img.shields.io/badge/mysql-8.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)

**SaaS B2B2C Multi-dispositivo (PWA) para la automatización operativa de gimnasios**

</div>

---

## 📋 Descripción

GymSync es un ecosistema SaaS que digitaliza y automatiza la gestión integral de gimnasios mediante:

- 🔐 **Autenticación PIN + Biometría** (WebAuthn)
- 🚦 **Control de acceso dual** (semáforo + tokens QR de un solo uso)
- 💰 **Validación bancaria automática** (OCR + parsing de emails)
- 🤖 **6 Agentes Autónomos** (FinanceAgent, AccessAgent, ChurnAgent, MetricsAgent, MarketingAgent, AI CoachAgent)
- 📱 **Offline-First** (IndexedDB + sincronización diferida)
- 🛒 **Marketplace in-app** con tokens de pickup de un solo uso

---

## 🗂️ Estructura del Monorepo

```
gymsync/
├── backend/          # API REST Node.js + Express + TypeORM
│   └── src/
│       ├── agents/   # 6 agentes autónomos
│       ├── config/   # DB, Swagger, Redis
│       ├── modules/  # Módulos por feature
│       ├── shared/   # Utils, middleware, guards
│       └── database/ # Migraciones y seeders
├── admin-web/        # Panel Admin Angular + PrimeNG (B2B)
├── pwa-socio/        # PWA del socio Ionic + Angular (B2C)
├── shared/           # Tipos y DTOs compartidos
├── AGENTS.md         # Catálogo de agentes autónomos
└── docker-compose.yml
```

---

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js >= 20
- Docker Desktop
- Git

### 1. Clonar y configurar
```bash
git clone https://github.com/tu-org/gymsync.git
cd gymsync
cp .env.example .env
# Editar .env con tus valores
```

### 2. Levantar servicios con Docker
```bash
docker-compose up -d
# MySQL en :3306  |  Redis en :6379  |  API en :3000
# phpMyAdmin en :8080 (solo con --profile dev)
docker-compose --profile dev up -d
```

### 3. Instalar dependencias y correr backend
```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run dev
```

### 4. Verificar
- API: http://localhost:3000/api/v1/health
- Swagger: http://localhost:3000/api/docs

---

## 🌿 Flujo Git

```bash
# Crear rama de feature
git checkout develop
git checkout -b feature/be-modulo-descripcion

# Commit con convención
git commit -m "feat(modulo-N): descripcion del cambio"

# Subir y crear PR hacia develop
git push origin feature/be-modulo-descripcion
# → Crear PR en GitHub con el template .github/pull_request_template.md
```

### Convención de ramas
| Prefijo | Agente responsable | Ejemplo |
|---------|-------------------|---------|
| `feature/be-*` | backend-agent | `feature/be-auth-pin` |
| `feature/fe-*` | frontend-agent | `feature/fe-login-primeng` |
| `feature/ops-*` | devops-agent | `feature/ops-docker-setup` |

---

## 🎨 Paleta Corporativa

| Color | HEX | Uso |
|-------|-----|-----|
| Coral Rush | `#F4806A` | Botones CTA, acciones principales |
| Steel Teal | `#437F91` | Cards de información, iconos |
| Deep Moss | `#4C5E51` | Navbar, sidebar, fondos admin |
| Golden Wheat | `#D1B174` | Badges VIP, logros, medallas |
| Verde OK | `#10B981` | Semáforo AUTORIZADO |
| Rojo Alerta | `#EF4444` | Semáforo DENEGADO, morosos |

> ⚠️ **Regla:** Todos los componentes PrimeNG deben usar estos tokens de color.

---

## 🤖 Agentes Autónomos

Ver [AGENTS.md](./AGENTS.md) para el catálogo completo.

---

## 📄 Licencia

MIT © GymSync Dev Team
