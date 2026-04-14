# TalentTrade

TalentTrade es una aplicacion para intercambiar habilidades entre personas. El usuario crea su perfil, indica que puede ensenar y que quiere aprender, encuentra coincidencias compatibles, conversa con la otra persona, programa sesiones y valora la experiencia.

El proyecto esta pensado como una entrega de DAM con dos partes:

- API backend con Node.js, Express, Prisma, PostgreSQL y Socket.IO.
- Aplicacion movil con Expo, React Native, React Navigation y TanStack Query.

## Funcionalidades

- Registro e inicio de sesion con JWT.
- Perfil editable con nombre, ciudad, biografia, habilidades y disponibilidad semanal.
- Catalogo inicial de habilidades cargado desde seed.
- Sistema de coincidencias por compatibilidad entre habilidades ofrecidas y deseadas.
- Chat asociado a coincidencias aceptadas.
- Creacion y seguimiento de sesiones.
- Valoraciones entre usuarios despues de completar una sesion.
- API con nombres externos en espanol para que el contrato sea mas claro.

## Estructura

```text
src/
  app.ts
  index.ts
  intermediarios/
  rutas/
  tiempoReal/
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
```

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 16.
- Docker Desktop, opcional para levantar PostgreSQL facilmente.
- Expo Go, emulador Android/iOS o navegador para probar la aplicacion movil.

## Puesta En Marcha Del Backend

1. Instala dependencias en la raiz:

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

4. Ejecuta la migracion:

```bash
npx prisma migrate dev --name init
```

5. Carga las habilidades iniciales:

```bash
npm run prisma:seed
```

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

2. Instala dependencias:

```bash
npm install
```

3. Arranca Expo:

```bash
npm start
```

Por defecto, la app usa `http://localhost:4000` en iOS/web y `http://10.0.2.2:4000` en Android emulator. Si se prueba desde un movil fisico, hay que cambiar `URL_API` en `talenttrade-app/src/configuracion/configuracionApi.ts` por la IP local del ordenador.

## Scripts Utiles

Backend:

```bash
npm run dev
npm run build
npm run typecheck
npm run prisma:seed
```

App movil:

```bash
cd talenttrade-app
npm start
npm run typecheck
```

## Variables De Entorno

El archivo `.env.example` incluye la configuracion minima:

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:8081
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/talenttrade?schema=public"
JWT_SECRET=cambia_este_secreto_en_local
JWT_EXPIRES_IN=7d
```

## Flujo Principal De Uso

1. Crear dos usuarios.
2. Editar sus perfiles con biografia y ciudad.
3. Anadir una habilidad para ofrecer y otra para aprender en cada usuario.
4. Entrar en Descubrir y proponer un intercambio.
5. Aceptar la coincidencia desde el otro usuario.
6. Abrir el chat y enviar mensajes.
7. Crear disponibilidad semanal.
8. Programar una sesion desde la coincidencia aceptada.
9. Completar la sesion.
10. Crear una valoracion.

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

El archivo [pruebas/talenttrade.http](./pruebas/talenttrade.http) contiene peticiones ordenadas para probar el flujo principal con REST Client de VS Code. Tambien se pueden copiar las peticiones a Postman o Thunder Client.

Para preparar la defensa o una demostracion guiada, revisa [GUIA_PRESENTACION.md](./GUIA_PRESENTACION.md).

Para explicar las tecnologias usadas, por que se han elegido y donde se encuentran en el proyecto, revisa [MEMORIA_TECNICA.md](./MEMORIA_TECNICA.md).

Para revisar rapidamente que el codigo compila:

```bash
npm run typecheck
cd talenttrade-app
npm run typecheck
```
