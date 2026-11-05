# GymSync — Estado de avance (sesión)

## Completado
- Módulo 1 (Auth): entidad User, login PIN + JWT, generate PIN, guard RBAC, rutas.
- Módulo 2 (Members): entidades Plan/Membership, CRUD planes, asignación y congelamiento, rutas.
- Módulo 3 (Finance): rutas de cuentas bancarias y pagos (crear/listar/aprobar/rechazar). (Implementación por consultas/entidades a refinar.)

## Archivos clave
- backend/src/modules/auth/*
- backend/src/modules/members/*
- backend/src/modules/finance/finance.router.ts
- backend/src/app.ts (rutas auth + members + finance activadas)
- PLAN_MODULOS.md (plan completo M1..M10)
- gymsync/backend/src/database/init.sql (schema + seed)

## Entorno
- MySQL 8 local en puerto 3306, BD gymsync_db inicializada.
- Build: ts compila; dependencias npm afectadas por workspaces monorepo (revisar antes de correr dev).

## Pendiente al retomar
- Reparar runtime npm (workspaces) o instalar deps flat.
- Mover consultas de finance a repositorio/entidades reales.
- Continuar Módulo 4 etc. + frontends.
