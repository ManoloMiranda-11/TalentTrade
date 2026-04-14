# Memoria Tecnica

Este documento resume que se ha usado en TalentTrade, por que se ha usado y donde aparece dentro del proyecto. La idea es tener una explicacion clara para defender el trabajo ante el profesor.

## Resumen Del Proyecto

TalentTrade es una aplicacion movil con backend propio para que dos personas puedan intercambiar habilidades.

El flujo principal es:

1. Un usuario se registra o inicia sesion.
2. Completa su perfil.
3. Indica habilidades que puede ofrecer.
4. Indica habilidades que quiere aprender.
5. La aplicacion busca personas compatibles.
6. Se crea una coincidencia.
7. Los usuarios pueden hablar por chat.
8. Se puede programar una sesion.
9. Al terminar, se puede valorar la experiencia.

## Arquitectura General

El proyecto esta dividido en dos partes principales:

- Backend: API REST, autenticacion, base de datos, logica de negocio y chat en tiempo real.
- App movil: pantallas, formularios, navegacion y consumo de la API.

Estructura principal:

```text
TalentTrade/
  src/                  Backend
  prisma/               Modelo de base de datos, migraciones y seed
  pruebas/              Peticiones manuales para probar la API
  talenttrade-app/      Aplicacion movil
  README.md             Documentacion general
  GUIA_PRESENTACION.md  Chuleta para la demo
  MEMORIA_TECNICA.md    Explicacion tecnica para defensa
```

## Tecnologias Usadas

| Tecnologia | Para que se usa | Por que se eligio | Donde esta |
| --- | --- | --- | --- |
| TypeScript | Tipar backend y app | Ayuda a detectar errores antes de ejecutar | `package.json`, `tsconfig.json`, `talenttrade-app/tsconfig.json` |
| Node.js | Ejecutar el backend | Es una tecnologia habitual para APIs modernas | `src/index.ts` |
| Express | Crear rutas HTTP | Es sencillo, claro y suficiente para una API REST | `src/app.ts`, `src/rutas/` |
| PostgreSQL | Guardar datos reales | Base de datos relacional robusta y comun en proyectos web | `docker-compose.yml`, `.env`, `prisma/schema.prisma` |
| Prisma | Acceder a la base de datos | Evita escribir SQL manual para operaciones normales y tipa las consultas | `prisma/schema.prisma`, `src/utilidades/prisma.ts` |
| JWT | Mantener sesiones de usuario | Permite autenticar peticiones sin guardar sesiones en memoria | `src/intermediarios/autenticacion.middleware.ts` |
| bcryptjs | Cifrar contrasenas | Las contrasenas no se guardan en texto plano | `src/rutas/autenticacion.routes.ts` |
| Zod | Validar datos de entrada | Evita guardar o procesar datos mal formados | `src/rutas/*.routes.ts` |
| Socket.IO | Comunicacion en tiempo real | Permite preparar chat y eventos instantaneos | `src/tiempoReal/manejadores.ts` |
| Expo | Ejecutar la app movil | Facilita probar en navegador, emulador o movil con Expo Go | `talenttrade-app/package.json` |
| React Native | Interfaz movil | Permite crear pantallas moviles con componentes reutilizables | `talenttrade-app/src/pantallas/` |
| React Navigation | Navegacion entre pantallas | Gestiona login, pestanas y pantalla de chat | `talenttrade-app/src/navegacion/` |
| TanStack Query | Gestionar datos del servidor | Ayuda con carga, errores y refresco de datos | `talenttrade-app/src/pantallas/` |
| React Hook Form y Zod | Formularios y validacion en app | Facilitan validar datos antes de enviarlos | `talenttrade-app/src/pantallas/` |
| Expo Secure Store | Guardar el token | Guarda la sesion de forma mas segura en el dispositivo | `talenttrade-app/src/proveedores/ProveedorAutenticacion.tsx` |

## Backend

El backend esta en la carpeta:

```text
src/
```

Su responsabilidad es recibir peticiones de la app, validar datos, consultar la base de datos y devolver respuestas.

### Entrada Del Servidor

Archivo:

```text
src/index.ts
```

Aqui se crea el servidor HTTP, se conecta Express y se configura Socket.IO.

Explicacion para el profesor:

```text
Este archivo es el punto de entrada del backend. Arranca el servidor, usa el puerto configurado y registra los eventos en tiempo real.
```

### Configuracion De Express

Archivo:

```text
src/app.ts
```

Aqui se configuran:

- CORS, para permitir que la app llame a la API.
- Helmet, para cabeceras basicas de seguridad.
- Morgan, para ver logs de peticiones en desarrollo.
- JSON, para leer cuerpos de peticion.
- Ruta `/salud`, para comprobar que el backend esta funcionando.
- Rutas principales bajo `/api`.
- Manejadores de errores.

Explicacion para el profesor:

```text
En app.ts configuro la API antes de arrancarla: seguridad basica, logs, lectura de JSON, prueba de salud y rutas.
```

### Rutas De La API

Carpeta:

```text
src/rutas/
```

Archivos principales:

- `autenticacion.routes.ts`: registro e inicio de sesion.
- `usuarios.routes.ts`: perfil del usuario.
- `habilidades.routes.ts`: catalogo de habilidades y habilidades del usuario.
- `coincidencias.routes.ts`: descubrir personas compatibles y gestionar solicitudes.
- `mensajes.routes.ts`: mensajes de una conversacion.
- `sesiones.routes.ts`: programar, listar y cambiar estado de sesiones.
- `valoraciones.routes.ts`: crear y consultar valoraciones.
- `disponibilidad.routes.ts`: disponibilidad semanal del usuario.

Explicacion para el profesor:

```text
He separado cada bloque funcional en su propio archivo de rutas para que el proyecto no dependa de un unico archivo enorme.
```

### Autenticacion

Archivos:

```text
src/rutas/autenticacion.routes.ts
src/intermediarios/autenticacion.middleware.ts
```

Funcionamiento:

- El usuario se registra con nombre, correo y contrasena.
- La contrasena se cifra con bcryptjs.
- Al iniciar sesion se comprueba la contrasena.
- Si es correcta, se genera un token JWT.
- Las rutas privadas exigen enviar ese token.

Explicacion para el profesor:

```text
No guardo contrasenas en texto plano. Se guarda un hash y despues se usa JWT para identificar al usuario en las rutas privadas.
```

### Base De Datos

Archivo:

```text
prisma/schema.prisma
```

Tablas principales:

- `User`: usuarios.
- `Skill`: habilidades disponibles.
- `UserSkill`: habilidades que un usuario ofrece o quiere aprender.
- `Match`: coincidencias entre usuarios.
- `Conversation`: conversacion creada al aceptar una coincidencia.
- `Message`: mensajes del chat.
- `Availability`: disponibilidad semanal.
- `Session`: sesiones programadas.
- `Review`: valoraciones.

Explicacion para el profesor:

```text
La base de datos es relacional porque hay relaciones claras entre usuarios, habilidades, coincidencias, mensajes, sesiones y valoraciones.
```

### Prisma

Archivos:

```text
prisma/schema.prisma
prisma/seed.ts
src/utilidades/prisma.ts
```

Para que se usa:

- Definir el modelo de datos.
- Crear migraciones.
- Consultar la base de datos desde TypeScript.
- Cargar datos iniciales para la demo.

Explicacion para el profesor:

```text
Prisma me permite trabajar con la base de datos usando TypeScript y modelos tipados, reduciendo errores en consultas.
```

### Logica De Coincidencias

Archivo principal:

```text
src/rutas/coincidencias.routes.ts
```

La logica compara:

- Lo que el usuario actual ofrece.
- Lo que el usuario actual quiere aprender.
- Lo que otros usuarios ofrecen.
- Lo que otros usuarios quieren aprender.

Hay compatibilidad si:

- El candidato ofrece algo que el usuario quiere aprender.
- El candidato quiere aprender algo que el usuario actual ofrece.

Explicacion para el profesor:

```text
La coincidencia no se crea a mano. Se calcula comparando habilidades ofrecidas y deseadas entre usuarios.
```

### Serializadores

Archivo:

```text
src/utilidades/serializadores.ts
```

Para que sirven:

- Convertir datos internos de Prisma a respuestas mas claras para la app.
- Exponer nombres en espanol como `nombre`, `correo`, `estado` o `fechaCreacion`.
- Convertir estados internos a valores externos como `ACEPTADA`, `PROGRAMADA` o `AVANZADO`.

Explicacion para el profesor:

```text
Uso serializadores para separar como se guardan los datos internamente de como se envian a la aplicacion.
```

Nota importante:

```text
Algunos nombres internos de Prisma estan en ingles porque son enums y modelos tecnicos habituales, pero la API que consume la app devuelve nombres en espanol.
```

### Chat Y Tiempo Real

Archivo:

```text
src/tiempoReal/manejadores.ts
```

Para que se usa:

- Unirse a una conversacion.
- Enviar mensajes.
- Marcar mensajes como leidos.
- Avisar cuando alguien esta escribiendo.

Explicacion para el profesor:

```text
El backend tiene preparada la parte de tiempo real con Socket.IO para que el chat pueda funcionar con eventos instantaneos.
```

## App Movil

La app esta en:

```text
talenttrade-app/
```

Su responsabilidad es mostrar pantallas, recoger datos del usuario y comunicarse con el backend.

### Navegacion

Archivos:

```text
talenttrade-app/src/navegacion/NavegadorApp.tsx
talenttrade-app/src/navegacion/tiposNavegacion.ts
```

Para que se usa:

- Mostrar login y registro si no hay sesion.
- Mostrar la zona principal si el usuario esta autenticado.
- Separar las pantallas principales en pestanas.
- Abrir el chat como pantalla independiente.

Explicacion para el profesor:

```text
La navegacion cambia segun si hay token guardado. Si no hay sesion se muestra login, y si hay sesion se muestra la app principal.
```

### Pantallas

Carpeta:

```text
talenttrade-app/src/pantallas/
```

Pantallas principales:

- `PantallaInicioSesion.tsx`: entrada del usuario.
- `PantallaCrearCuenta.tsx`: registro.
- `PantallaPerfil.tsx`: datos personales y resumen.
- `PantallaHabilidades.tsx`: habilidades ofrecidas y deseadas.
- `PantallaDescubrir.tsx`: propuestas compatibles.
- `PantallaCoincidencias.tsx`: solicitudes y coincidencias aceptadas.
- `PantallaChat.tsx`: conversacion entre usuarios.
- `PantallaSesiones.tsx`: sesiones y valoraciones.

Explicacion para el profesor:

```text
Cada pantalla representa una parte del flujo real de la aplicacion, desde crear cuenta hasta valorar una sesion.
```

### Componentes Reutilizables

Carpeta:

```text
talenttrade-app/src/componentes/
```

Componentes:

- `Pantalla.tsx`: estructura comun de pantalla.
- `Tarjeta.tsx`: bloque visual reutilizable.
- `CampoFormulario.tsx`: campo de formulario.
- `EstadoVacio.tsx`: mensaje cuando no hay datos.
- `CabeceraDestacada.tsx`: cabecera visual.

Explicacion para el profesor:

```text
He creado componentes reutilizables para no repetir estilos y mantener una interfaz coherente.
```

### Servicios De API

Archivo:

```text
talenttrade-app/src/servicios/clienteApi.ts
```

Para que se usa:

- Centralizar las llamadas `fetch`.
- Anadir el token cuando hace falta.
- Leer errores del backend.
- Evitar repetir la misma logica en cada pantalla.

Explicacion para el profesor:

```text
La app no llama al backend de cualquier forma desde cada pantalla. Tiene un cliente centralizado para que las peticiones sean consistentes.
```

### Configuracion De URL

Archivo:

```text
talenttrade-app/src/configuracion/configuracionApi.ts
```

Para que se usa:

- Definir la URL del backend.
- Diferenciar entre navegador, emulador Android o movil fisico.

Explicacion para el profesor:

```text
La URL de la API esta centralizada para cambiarla en un solo sitio si pruebo en web, emulador o movil.
```

### Proveedor De Autenticacion

Archivo:

```text
talenttrade-app/src/proveedores/ProveedorAutenticacion.tsx
```

Para que se usa:

- Guardar el token.
- Saber si el usuario esta autenticado.
- Compartir funciones de login, registro y cierre de sesion.
- Recuperar la sesion al abrir la app.

Explicacion para el profesor:

```text
Uso un proveedor para que toda la app pueda saber si hay sesion sin pasar el token manualmente pantalla por pantalla.
```

### Tipos De La API

Archivo:

```text
talenttrade-app/src/tipos/tiposApi.ts
```

Para que se usa:

- Definir como son los datos que llegan del backend.
- Evitar errores al usar usuarios, habilidades, coincidencias, mensajes, sesiones y valoraciones.

Explicacion para el profesor:

```text
Los tipos hacen que la app sepa que estructura tienen las respuestas del backend.
```

## Seguridad Basica

Medidas incluidas:

- Contrasenas cifradas con bcryptjs.
- Tokens JWT para rutas privadas.
- Middleware para bloquear peticiones sin sesion.
- Validacion de datos con Zod.
- Helmet para cabeceras basicas de seguridad.
- CORS configurado.

Explicacion para el profesor:

```text
No es una seguridad de produccion completa, pero incluye las bases: contrasenas cifradas, autenticacion por token, validacion y protecciones HTTP basicas.
```

## Datos De Prueba

Archivos:

```text
prisma/seed.ts
pruebas/talenttrade.http
```

Para que se usan:

- `seed.ts` carga habilidades y usuarios de ejemplo.
- `talenttrade.http` permite probar endpoints desde VS Code con REST Client.

Explicacion para el profesor:

```text
El seed facilita tener datos preparados para la demo, y el archivo HTTP permite comprobar la API sin depender solo de la app movil.
```

## Scripts Importantes

Backend:

```powershell
npm run dev
npm run build
npm run typecheck
npm run prisma:seed
```

App:

```powershell
cd talenttrade-app
npm start
npm run typecheck
```

Explicacion para el profesor:

```text
Tengo scripts separados para desarrollo, compilacion, comprobacion de tipos, carga de datos y arranque de la app.
```

## Decisiones Que Puedes Defender

### Por Que Separar Backend Y App

```text
Porque asi la app movil no contiene la logica principal ni accede directamente a la base de datos. La app solo consume una API.
```

### Por Que Usar PostgreSQL

```text
Porque el proyecto tiene muchas relaciones: usuarios con habilidades, coincidencias, conversaciones, mensajes, sesiones y valoraciones.
```

### Por Que Usar Prisma

```text
Porque permite trabajar con la base de datos de forma tipada y mas segura desde TypeScript.
```

### Por Que Usar JWT

```text
Porque cada peticion privada puede identificar al usuario sin depender de sesiones guardadas en el servidor.
```

### Por Que Usar React Native Y Expo

```text
Porque permite desarrollar una app movil y probarla facilmente en navegador, emulador o movil real.
```

### Por Que Crear Serializadores

```text
Porque separan el modelo interno de la base de datos del contrato externo que recibe la app.
```

## Que Mostrar Si El Profesor Pide Ver Codigo

Orden recomendado:

1. `prisma/schema.prisma`, para ensenar la estructura de datos.
2. `src/app.ts`, para ensenar como se configura la API.
3. `src/rutas/autenticacion.routes.ts`, para ensenar registro, login y JWT.
4. `src/rutas/coincidencias.routes.ts`, para ensenar la logica principal del proyecto.
5. `src/utilidades/serializadores.ts`, para ensenar la conversion a nombres claros en espanol.
6. `talenttrade-app/src/navegacion/NavegadorApp.tsx`, para ensenar la navegacion.
7. `talenttrade-app/src/servicios/clienteApi.ts`, para ensenar como la app consume el backend.
8. `talenttrade-app/src/pantallas/PantallaDescubrir.tsx`, para ensenar una pantalla conectada al backend.

Frase util:

```text
Si tengo que resumir el codigo, ensenaria primero el modelo de datos, despues las rutas del backend y por ultimo una pantalla de la app consumiendo esa API.
```

## Mejoras Futuras

Estas mejoras no son necesarias para la entrega, pero se pueden mencionar si preguntan como continuaria el proyecto:

- Recuperacion de contrasena.
- Notificaciones push.
- Subida real de avatar.
- Filtros por ciudad o categoria.
- Despliegue del backend.
- Generacion de APK.
- Tests automatizados.
- Chat en tiempo real conectado tambien desde la app movil.

Frase util:

```text
El proyecto ya cubre el flujo completo, y estas mejoras serian la siguiente fase si se quisiera llevar a produccion.
```
