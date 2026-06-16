# Guía de Despliegue

Este documento describe el **proceso de despliegue** de TalentTrade: cómo ponerlo en marcha en local de forma reproducible y cómo llevarlo a internet (backend, base de datos y app).

Arquitectura del despliegue:

```text
App (Expo: web / Android / iOS)  ──HTTPS · API REST──▶  Backend (Node + Express)  ──Prisma──▶  PostgreSQL
```

---

## 1. Despliegue en local (reproducible)

Requisitos previos: **Node.js 20+**, **Docker Desktop** (o PostgreSQL 16 instalado) y **Expo Go** / emulador / navegador.

```bash
# 1. Base de datos PostgreSQL en un contenedor
docker compose up -d

# 2. Backend
copy .env.example .env          # crea el fichero de entorno
npm install
npx prisma migrate deploy       # aplica las migraciones
npm run prisma:seed             # carga catálogo + usuarios demo
npm run dev                     # API en http://localhost:4000
```

Comprueba que el backend responde en `http://localhost:4000/salud`.

```bash
# 3. App (en otra terminal)
cd talenttrade-app
npm install
npm start                       # pulsa w (web), a (emulador) o escanea el QR con Expo Go
```

Tras estos pasos la aplicación queda operativa con datos de demostración. Puedes entrar con `ana.garcia@talenttrade.es` / `123456`.

---

## 2. Despliegue en producción (backend + base de datos en Render)

[Render](https://render.com) ofrece plan gratuito tanto para el servicio web como para PostgreSQL. El proceso (desde el panel de Render, conectado a GitHub) es:

1. **Base de datos:** `New → PostgreSQL` (plan *Free*). Al crearse, copia la *Internal Database URL*.
2. **Backend:** `New → Web Service` y selecciona el repositorio `TalentTrade`. Configura:
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/salud`
   - **Variables de entorno:**
     | Clave | Valor |
     | --- | --- |
     | `DATABASE_URL` | (la *Internal Database URL* del paso 1) |
     | `JWT_SECRET` | (un texto largo y aleatorio) |
     | `JWT_EXPIRES_IN` | `7d` |
     | `NODE_ENV` | `production` |
     | `CLIENT_URL` | `*` |
3. **Deploy.** Cuando el servicio quede *Live*, comprueba `https://TU-SERVICIO.onrender.com/salud`.
4. **Datos demo:** abre la pestaña *Shell* del servicio y ejecuta `npm run prisma:seed`.

> El backend no necesita cambios de código: ya lee el puerto desde `process.env.PORT` y la conexión desde `DATABASE_URL`.

---

## 3. Frontend (web y APK)

- **Web:** desde `talenttrade-app/`, `npx expo export --platform web` genera una carpeta `dist` estática que se puede publicar en un *Render Static Site* o en [Netlify Drop](https://app.netlify.com/drop). La URL del backend de producción se indica con la variable `EXPO_PUBLIC_API_URL` al construir.
- **APK (Android):** con `eas-cli` (`npm i -g eas-cli`, `eas login`) ejecutar `eas build -p android --profile preview`. EAS devuelve un enlace para descargar el `.apk` e instalarlo.

---

## 4. Variables de entorno (backend)

| Variable | Ejemplo | Descripción |
| --- | --- | --- |
| `PORT` | `4000` | Puerto del servidor (Render lo asigna solo). |
| `NODE_ENV` | `production` | Entorno de ejecución. |
| `CLIENT_URL` | `*` | Orígenes permitidos por CORS. |
| `DATABASE_URL` | `postgresql://...` | Conexión a PostgreSQL. |
| `JWT_SECRET` | `(secreto largo)` | Clave para firmar los JWT. |
| `JWT_EXPIRES_IN` | `7d` | Caducidad de los tokens. |

---

## 5. Notas sobre el plan gratuito de Render

- El **servicio web gratuito se duerme** tras unos 15 minutos sin tráfico: la primera petición tras el reposo puede tardar ~30-50 s. Para una demo, basta con abrir `/salud` un minuto antes de empezar.
- La **base de datos gratuita** caduca a los 90 días, suficiente para la entrega.
