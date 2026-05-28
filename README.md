# TalentTrade

TalentTrade es una aplicación para intercambiar habilidades entre personas. El usuario crea su perfil, indica qué puede enseñar y qué quiere aprender, encuentra coincidencias compatibles, conversa con la otra persona, programa sesiones y valora la experiencia.

El proyecto está pensado como una entrega de DAM con dos partes:

- API backend con Node.js, Express, Prisma y PostgreSQL.
- Aplicación móvil con Expo, React Native, React Navigation y TanStack Query.

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Perfil editable con nombre, ciudad, biografía, habilidades y disponibilidad semanal.
- Catálogo inicial de habilidades cargado desde seed.
- Sistema de coincidencias por compatibilidad entre habilidades ofrecidas y deseadas.
- Chat asociado a coincidencias aceptadas.
- Creación y seguimiento de sesiones.
- Valoraciones entre usuarios después de completar una sesión.
- API con nombres externos en español para que el contrato sea más claro.

## Estructura

```text
src/
  app.ts
  index.ts
  intermediarios/
  rutas/
  utilidades/

prisma/
  schema.prisma
  seed.ts
  migrations/

talenttrade-app/
  src/
    componentes/
    configuracion/
    navegacion/
    pantallas/
    proveedores/
    servicios/
    tipos/

pruebas/
  talenttrade.http

GUIA_PRESENTACION.md
GUIA_PRUEBAS.md
MEMORIA_TECNICA.md
```

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 16.
- Docker Desktop, opcional para levantar PostgreSQL fácilmente.
- Expo Go, emulador Android/iOS o navegador para probar la aplicación móvil.

## Puesta En Marcha Del Backend

1. Instala las dependencias en la raíz:

```bash
npm install
```

2. Crea el archivo de entorno:

```bash
copy .env.example .env
```

3. Si usas Docker, levanta PostgreSQL:

```bash
docker compose up -d
```

4. Ejecuta la migración:

```bash
npx prisma migrate dev --name init
```

5. Carga las habilidades iniciales y los usuarios de demo (Ana y Carlos):

```bash
npm run prisma:seed
```

El seed crea 30 habilidades, dos usuarios listos para entrar (`ana.garcia@talenttrade.es` y `carlos.martin@talenttrade.es`, contraseña `123456`) y una coincidencia aceptada entre ellos para que la demo se pueda mostrar sin tocar nada más.

6. Arranca la API:

```bash
npm run dev
```

La API queda disponible en `http://localhost:4000`.

## Puesta En Marcha De La App

1. Entra en la carpeta de la app:

```bash
cd talenttrade-app
```

2. Instala las dependencias:

```bash
npm install
```

3. Arranca Expo:

```bash
npm start
```

Por defecto, la app usa `http://localhost:4000` en iOS y web, y `http://10.0.2.2:4000` en el emulador de Android. Si se prueba desde un móvil físico, hay que cambiar `URL_API` en `talenttrade-app/src/configuracion/configuracionApi.ts` por la IP local del ordenador.

## Scripts Útiles

Backend:

```bash
npm run dev
npm run build
npm run typecheck
npm run prisma:seed
```

App móvil:

```bash
cd talenttrade-app
npm start
npm run typecheck
```

## Variables De Entorno

El archivo `.env.example` incluye la configuración mínima:

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:8081
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/talenttrade?schema=public"
JWT_SECRET=cambia_este_secreto_en_local
JWT_EXPIRES_IN=7d
```

## Demo Rápida Con El Seed

El seed deja la demo lista en tres pasos:

```bash
docker compose up -d
npm run prisma:seed
npm run dev
```

Después, en otra terminal:

```bash
cd talenttrade-app
npm start
```

Para abrir la app puedes pulsar `w` (navegador), `a` (emulador Android) o escanear el código QR con Expo Go.

Usuarios listos para entrar:

| Nombre | Correo | Contraseña | Ofrece | Quiere aprender |
| --- | --- | --- | --- | --- |
| Ana García | `ana.garcia@talenttrade.es` | `123456` | Programación | Inglés |
| Carlos Martín | `carlos.martin@talenttrade.es` | `123456` | Inglés | Programación |

Ya existe una coincidencia aceptada entre ambos, así que el chat y la programación de sesiones pueden mostrarse sin pasos previos.

## Flujo Principal De Uso

Si se prefiere empezar desde cero, el recorrido es:

1. Crear dos usuarios.
2. Editar sus perfiles con biografía y ciudad.
3. Añadir una habilidad para ofrecer y otra para aprender en cada usuario.
4. Entrar en Descubrir y proponer un intercambio.
5. Aceptar la coincidencia desde el otro usuario.
6. Abrir el chat y enviar mensajes.
7. Crear disponibilidad semanal.
8. Programar una sesión desde la coincidencia aceptada.
9. Completar la sesión.
10. Crear una valoración.

## Valores Principales De La API

Habilidades de usuario:

- `tipo`: `OFRECER` o `APRENDER`.
- `nivel`: `INICIAL`, `MEDIO` o `AVANZADO`.

Coincidencias:

- `estado`: `PENDIENTE`, `ACEPTADA`, `RECHAZADA` o `CANCELADA`.

Sesiones:

- `estado`: `PROGRAMADA`, `COMPLETADA` o `CANCELADA`.

Disponibilidad:

- `diaSemana`: `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT` o `SUN`.
- `horaInicio` y `horaFin`: formato `HH:mm`.

## Endpoints Principales

- `POST /api/autenticacion/registro`
- `POST /api/autenticacion/inicio-sesion`
- `GET /api/usuarios/yo`
- `PATCH /api/usuarios/yo`
- `GET /api/habilidades`
- `POST /api/habilidades/yo`
- `DELETE /api/habilidades/yo/:habilidadUsuarioId`
- `GET /api/coincidencias/descubrir`
- `GET /api/coincidencias/yo`
- `POST /api/coincidencias`
- `PATCH /api/coincidencias/:coincidenciaId/estado`
- `GET /api/mensajes/:conversacionId`
- `POST /api/mensajes/:conversacionId`
- `POST /api/sesiones`
- `GET /api/sesiones/yo`
- `PATCH /api/sesiones/:sesionId/estado`
- `POST /api/valoraciones`
- `GET /api/valoraciones/yo`
- `GET /api/disponibilidad/yo`
- `POST /api/disponibilidad/yo`
- `DELETE /api/disponibilidad/yo/:disponibilidadId`

## Pruebas Manuales

El archivo [pruebas/talenttrade.http](./pruebas/talenttrade.http) contiene peticiones ordenadas para probar el flujo principal con REST Client de VS Code. También se pueden copiar las peticiones a Postman o Thunder Client.

Para comprobar todo el proyecto paso a paso antes de presentarlo, revisa [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md).

Para preparar la defensa o una demostración guiada, revisa [GUIA_PRESENTACION.md](./GUIA_PRESENTACION.md).

Para explicar las tecnologías usadas, por qué se han elegido y dónde se encuentran en el proyecto, revisa [MEMORIA_TECNICA.md](./MEMORIA_TECNICA.md).

Para revisar rápidamente que el código compila:

```bash
npm run typecheck
cd talenttrade-app
npm run typecheck
```
