# Deploy GymSync (Docker en nube)

## Levantar stack
1. Copia `backend/.env.example` a `backend/.env` y ajusta credenciales/seguridad.
2. `docker compose up -d --build`
3. Ejecuta `init.sql` en la BD y aplica migraciones.

## Backup diario (ejemplo cron)
0 2 * * * docker exec gymsync_mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" gymsync_db | gzip > /backups/gymsync_$(date +\%F).sql.gz

## Monitoreo
Healthcheck: GET http://tu-host:3000/api/v1/health
Revisa checks.database y checks.redis.
Logs: docker compose logs -f api

## Produccion
- Node env: NODE_ENV=production
- JWT_SECRET único y largo.
- Deshabilita phpMyAdmin (profile dev) en producción.
- Use un proxy (Nginx/Traefik) con HTTPS.
