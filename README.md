# TalentTrade Backend

Backend del proyecto TalentTrade para el TFG de DAM. Esta API gestiona autenticacion, perfil de usuario, habilidades, coincidencias, chat, sesiones, valoraciones y disponibilidad semanal.

## Requisitos

- Node.js 20 o superior
- PostgreSQL 16

Tambien puedes levantar PostgreSQL con Docker usando el archivo [docker-compose.yml](./docker-compose.yml).

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu entorno local:

```bash
copy .env.example .env
```

3. Si usas Docker, levanta la base de datos:

```bash
docker compose up -d
```

4. Ejecuta la migracion inicial:

```bash
npx prisma migrate dev --name init
```

5. Carga las habilidades iniciales:

```bash
npx prisma db seed
```

6. Arranca el servidor:

```bash
npm run dev
```

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/skills`
- `POST /api/skills/me`
- `DELETE /api/skills/me/:userSkillId`
- `GET /api/matches/discover`
- `GET /api/matches/me`
- `POST /api/matches`
- `PATCH /api/matches/:matchId/status`
- `GET /api/messages/:conversationId`
- `POST /api/messages/:conversationId`
- `POST /api/sessions`
- `GET /api/sessions/me`
- `PATCH /api/sessions/:sessionId/status`
- `POST /api/reviews`
- `GET /api/reviews/me`
- `GET /api/availability/me`
- `POST /api/availability/me`
- `DELETE /api/availability/me/:availabilityId`

## Pruebas manuales

Puedes usar el archivo [talenttrade.http](./pruebas/talenttrade.http) con VS Code REST Client o copiar las peticiones a Postman/Thunder Client.
