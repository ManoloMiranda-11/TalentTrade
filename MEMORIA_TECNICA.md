# Memoria Técnica

Este documento resume qué se ha usado en TalentTrade, por qué se ha usado y dónde aparece dentro del proyecto. La idea es tener una explicación clara para defender el trabajo ante el profesor.

Para comprobar el funcionamiento completo antes de la defensa, usa también [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md).

## Resumen Del Proyecto

TalentTrade es una aplicación móvil con backend propio para que dos personas puedan intercambiar habilidades.

El flujo principal es:

1. Un usuario se registra o inicia sesión.
2. Completa su perfil.
3. Indica habilidades que puede ofrecer.
4. Indica habilidades que quiere aprender.
5. La aplicación busca personas compatibles.
6. Se crea una coincidencia.
7. Los usuarios pueden hablar por chat.
8. Se puede programar una sesión.
9. Al terminar, se puede valorar la experiencia.

## Arquitectura General

El proyecto está dividido en dos partes principales:

- Backend: API REST, autenticación, base de datos, lógica de negocio y chat persistente.
- App móvil: pantallas, formularios, navegación y consumo de la API.

Estructura principal:

```text
TalentTrade/
  src/                  Backend
  prisma/               Modelo de base de datos, migraciones y seed
  pruebas/              Peticiones manuales para probar la API
  talenttrade-app/      Aplicación móvil
  README.md             Documentación general
  GUIA_PRESENTACION.md  Chuleta para la demo
  GUIA_PRUEBAS.md       Guía para comprobar el flujo completo
  MEMORIA_TECNICA.md    Explicación técnica para defensa
```

## Tecnologías Usadas

| Tecnología | Para qué se usa | Por qué se eligió | Dónde está |
| --- | --- | --- | --- |
| TypeScript | Tipar backend y app | Ayuda a detectar errores antes de ejecutar | `package.json`, `tsconfig.json`, `talenttrade-app/tsconfig.json` |
| Node.js | Ejecutar el backend | Es una tecnología habitual para APIs modernas | `src/index.ts` |
| Express | Crear rutas HTTP | Es sencillo, claro y suficiente para una API REST | `src/app.ts`, `src/rutas/` |
| PostgreSQL | Guardar datos reales | Base de datos relacional robusta y común en proyectos web | `docker-compose.yml`, `.env`, `prisma/schema.prisma` |
| Prisma | Acceder a la base de datos | Evita escribir SQL manual para operaciones normales y tipa las consultas | `prisma/schema.prisma`, `src/utilidades/prisma.ts` |
| JWT | Mantener sesiones de usuario | Permite autenticar peticiones sin guardar sesiones en memoria | `src/intermediarios/autenticacion.middleware.ts` |
| bcryptjs | Cifrar contraseñas | Las contraseñas no se guardan en texto plano | `src/rutas/autenticacion.routes.ts` |
| Zod | Validar datos de entrada | Evita guardar o procesar datos mal formados | `src/rutas/*.routes.ts` |
| Expo | Ejecutar la app móvil | Facilita probar en navegador, emulador o móvil con Expo Go | `talenttrade-app/package.json` |
| React Native | Interfaz móvil | Permite crear pantallas móviles con componentes reutilizables | `talenttrade-app/src/pantallas/` |
| React Navigation | Navegación entre pantallas | Gestiona login, pestañas y pantalla de chat | `talenttrade-app/src/navegacion/` |
| TanStack Query | Gestionar datos del servidor | Ayuda con carga, errores y refresco de datos | `talenttrade-app/src/pantallas/` |
| Zod | Validar formularios en la app | Mismas reglas que en el backend, validación antes de enviar al servidor | `talenttrade-app/src/pantallas/PantallaInicioSesion.tsx`, `talenttrade-app/src/pantallas/PantallaCrearCuenta.tsx` |
| Expo Secure Store | Guardar el token | Guarda la sesión de forma más segura en el dispositivo | `talenttrade-app/src/proveedores/ProveedorAutenticacion.tsx` |
| DateTimePicker | Selector nativo de fecha y hora | Elegir fecha de sesión y huecos de disponibilidad sin teclear formatos | `talenttrade-app/src/pantallas/PantallaCoincidencias.tsx`, `talenttrade-app/src/pantallas/PantallaPerfil.tsx` |

## Backend

El backend está en la carpeta:

```text
src/
```

Su responsabilidad es recibir peticiones de la app, validar datos, consultar la base de datos y devolver respuestas.

### Entrada Del Servidor

Archivo:

```text
src/index.ts
```

Aquí se arranca el servidor Express en el puerto configurado.

Explicación para el profesor:

```text
Este archivo es el punto de entrada del backend. Lee el puerto del entorno y arranca la API construida en app.ts.
```

### Configuración De Express

Archivo:

```text
src/app.ts
```

Aquí se configuran:

- CORS, para permitir que la app llame a la API.
- Helmet, para cabeceras básicas de seguridad.
- JSON, para leer cuerpos de petición.
- Ruta `/salud`, para comprobar que el backend está funcionando.
- Rutas principales bajo `/api`.
- Manejadores de errores.

Explicación para el profesor:

```text
En app.ts configuro la API antes de arrancarla: seguridad básica, lectura de JSON, prueba de salud y rutas.
```

### Rutas De La API

Carpeta:

```text
src/rutas/
```

Archivos principales:

- `autenticacion.routes.ts`: registro e inicio de sesión.
- `usuarios.routes.ts`: perfil del usuario.
- `habilidades.routes.ts`: catálogo de habilidades y habilidades del usuario.
- `coincidencias.routes.ts`: descubrir personas compatibles y gestionar solicitudes.
- `mensajes.routes.ts`: mensajes de una conversación.
- `sesiones.routes.ts`: programar, listar y cambiar estado de sesiones.
- `valoraciones.routes.ts`: crear y consultar valoraciones.
- `disponibilidad.routes.ts`: disponibilidad semanal del usuario.

Explicación para el profesor:

```text
He separado cada bloque funcional en su propio archivo de rutas para que el proyecto no dependa de un único archivo enorme.
```

### Autenticación

Archivos:

```text
src/rutas/autenticacion.routes.ts
src/intermediarios/autenticacion.middleware.ts
```

Funcionamiento:

- El usuario se registra con nombre, correo y contraseña.
- La contraseña se cifra con bcryptjs.
- Al iniciar sesión se comprueba la contraseña.
- Si es correcta, se genera un token JWT.
- Las rutas privadas exigen enviar ese token.

Explicación para el profesor:

```text
No guardo contraseñas en texto plano. Se guarda un hash y después se usa JWT para identificar al usuario en las rutas privadas.
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
- `Conversation`: conversación creada al aceptar una coincidencia.
- `Message`: mensajes del chat.
- `Availability`: disponibilidad semanal.
- `Session`: sesiones programadas.
- `Review`: valoraciones.

Explicación para el profesor:

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

Para qué se usa:

- Definir el modelo de datos.
- Crear migraciones.
- Consultar la base de datos desde TypeScript.
- Cargar datos iniciales para la demo.

Explicación para el profesor:

```text
Prisma me permite trabajar con la base de datos usando TypeScript y modelos tipados, reduciendo errores en las consultas.
```

### Lógica De Coincidencias

Archivo principal:

```text
src/rutas/coincidencias.routes.ts
```

La lógica compara:

- Lo que el usuario actual ofrece.
- Lo que el usuario actual quiere aprender.
- Lo que otros usuarios ofrecen.
- Lo que otros usuarios quieren aprender.

Hay compatibilidad si:

- El candidato ofrece algo que el usuario quiere aprender.
- El candidato quiere aprender algo que el usuario actual ofrece.

Explicación para el profesor:

```text
La coincidencia no se crea a mano. Se calcula comparando habilidades ofrecidas y deseadas entre usuarios.
```

### Serializadores

Archivo:

```text
src/utilidades/serializadores.ts
```

Para qué sirven:

- Convertir datos internos de Prisma a respuestas más claras para la app.
- Exponer nombres en español como `nombre`, `correo`, `estado` o `fechaCreacion`.
- Convertir estados internos a valores externos como `ACEPTADA`, `PROGRAMADA` o `AVANZADO`.

Explicación para el profesor:

```text
Uso serializadores para separar cómo se guardan los datos internamente de cómo se envían a la aplicación.
```

Nota importante:

```text
Algunos nombres internos de Prisma están en inglés porque son enums y modelos técnicos habituales, pero la API que consume la app devuelve nombres en español.
```

### Chat Persistente

Archivos:

```text
src/rutas/mensajes.routes.ts
talenttrade-app/src/pantallas/PantallaChat.tsx
```

Funcionamiento:

- Cuando se acepta una coincidencia, el backend crea automáticamente una conversación asociada.
- La app envía mensajes con `POST /api/mensajes/:conversacionId` y los recibe con `GET /api/mensajes/:conversacionId`.
- La pantalla de chat refresca la conversación cada pocos segundos con TanStack Query para mostrar los mensajes nuevos.
- Al consultar mensajes, el backend marca como leídos los que no son del propio usuario.

Explicación para el profesor:

```text
El chat se guarda en base de datos para que los mensajes no se pierdan al cerrar la app. La pantalla pregunta al backend cada pocos segundos si hay mensajes nuevos. Esto es suficiente para el flujo del proyecto y mantiene la arquitectura simple.
```

## App Móvil

La app está en:

```text
talenttrade-app/
```

Su responsabilidad es mostrar pantallas, recoger datos del usuario y comunicarse con el backend.

### Navegación

Archivos:

```text
talenttrade-app/src/navegacion/NavegadorApp.tsx
talenttrade-app/src/navegacion/tiposNavegacion.ts
```

Para qué se usa:

- Mostrar login y registro si no hay sesión.
- Mostrar la zona principal si el usuario está autenticado.
- Separar las pantallas principales en pestañas.
- Abrir el chat como pantalla independiente.

Explicación para el profesor:

```text
La navegación cambia según si hay token guardado. Si no hay sesión se muestra login, y si hay sesión se muestra la app principal.
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
- `PantallaChat.tsx`: conversación entre usuarios.
- `PantallaSesiones.tsx`: sesiones y valoraciones.

Explicación para el profesor:

```text
Cada pantalla representa una parte del flujo real de la aplicación, desde crear cuenta hasta valorar una sesión.
```

### Componentes Reutilizables

Carpeta:

```text
talenttrade-app/src/componentes/
```

Componentes:

- `Pantalla.tsx`: estructura común de pantalla.
- `Tarjeta.tsx`: bloque visual reutilizable.
- `CampoFormulario.tsx`: campo de formulario.
- `EstadoVacio.tsx`: mensaje cuando no hay datos.
- `CabeceraDestacada.tsx`: cabecera visual.

Explicación para el profesor:

```text
He creado componentes reutilizables para no repetir estilos y mantener una interfaz coherente.
```

### Servicios De API

Archivo:

```text
talenttrade-app/src/servicios/clienteApi.ts
```

Para qué se usa:

- Centralizar las llamadas `fetch`.
- Añadir el token cuando hace falta.
- Leer errores del backend.
- Evitar repetir la misma lógica en cada pantalla.

Explicación para el profesor:

```text
La app no llama al backend de cualquier forma desde cada pantalla. Tiene un cliente centralizado para que las peticiones sean consistentes.
```

### Configuración De URL

Archivo:

```text
talenttrade-app/src/configuracion/configuracionApi.ts
```

Para qué se usa:

- Definir la URL del backend.
- Diferenciar entre navegador, emulador Android o móvil físico.

Explicación para el profesor:

```text
La URL de la API está centralizada para cambiarla en un solo sitio si pruebo en web, emulador o móvil.
```

### Proveedor De Autenticación

Archivo:

```text
talenttrade-app/src/proveedores/ProveedorAutenticacion.tsx
```

Para qué se usa:

- Guardar el token.
- Saber si el usuario está autenticado.
- Compartir las funciones de login, registro y cierre de sesión.
- Recuperar la sesión al abrir la app.

Explicación para el profesor:

```text
Uso un proveedor para que toda la app pueda saber si hay sesión sin pasar el token manualmente pantalla por pantalla.
```

### Tipos De La API

Archivo:

```text
talenttrade-app/src/tipos/tiposApi.ts
```

Para qué se usa:

- Definir cómo son los datos que llegan del backend.
- Evitar errores al usar usuarios, habilidades, coincidencias, mensajes, sesiones y valoraciones.

Explicación para el profesor:

```text
Los tipos hacen que la app sepa qué estructura tienen las respuestas del backend.
```

### Selectores Nativos De Fecha Y Hora

Archivos:

```text
talenttrade-app/src/pantallas/PantallaCoincidencias.tsx
talenttrade-app/src/pantallas/PantallaPerfil.tsx
```

Para qué se usa:

- Elegir fecha y hora de una sesión sin teclear formatos.
- Elegir las horas de inicio y fin de cada hueco de disponibilidad.
- Evitar errores de formato (`AAAA-MM-DD`, `HH:mm`) porque el componente nativo siempre devuelve un objeto `Date` válido.

Funcionamiento:

- La pantalla guarda la fecha como `Date` en el estado.
- Al pulsar el campo se muestra el selector nativo del sistema (`@react-native-community/datetimepicker`).
- Antes de enviar al backend se convierte a `ISOString` para sesiones o a `HH:mm` para disponibilidad.

Explicación para el profesor:

```text
Uso el selector nativo de fecha y hora para que la experiencia se parezca a una app real y para evitar errores de formato. La validación sigue estando en el backend con Zod.
```

## Seguridad Básica

Medidas incluidas:

- Contraseñas cifradas con bcryptjs.
- Tokens JWT para rutas privadas.
- Middleware para bloquear peticiones sin sesión.
- Validación de datos con Zod.
- Helmet para cabeceras básicas de seguridad.
- CORS configurado.

Explicación para el profesor:

```text
No es una seguridad de producción completa, pero incluye las bases: contraseñas cifradas, autenticación por token, validación y protecciones HTTP básicas.
```

## Datos De Prueba

Archivos:

```text
prisma/seed.ts
pruebas/talenttrade.http
```

Para qué se usan:

- `seed.ts` carga las habilidades de ejemplo, crea los usuarios demo (Ana y Carlos) con su perfil y habilidades, y deja preparada una coincidencia aceptada entre ellos para la defensa.
- `talenttrade.http` permite probar endpoints desde VS Code con REST Client.

Qué crea el seed exactamente:

- 30 habilidades repartidas por categoría (Tecnología, Idiomas, Música, Bienestar, etc.).
- Usuario `Ana García` (`ana.garcia@talenttrade.es` / `123456`, Madrid, ofrece Programación en nivel Avanzado, quiere aprender Inglés en nivel Medio).
- Usuario `Carlos Martín` (`carlos.martin@talenttrade.es` / `123456`, Valencia, ofrece Inglés en nivel Avanzado, quiere aprender Programación en nivel Inicial).
- Una coincidencia con estado `ACEPTADA` entre Ana y Carlos.
- La conversación asociada a esa coincidencia, lista para abrir el chat.

Explicación para el profesor:

```text
El seed deja la demo lista en un solo comando. No hace falta crear usuarios manualmente en cada defensa, y se puede enseñar el flujo completo desde la primera pantalla con datos coherentes. El archivo HTTP, además, permite comprobar la API sin depender solo de la app móvil.
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

Explicación para el profesor:

```text
Tengo scripts separados para desarrollo, compilación, comprobación de tipos, carga de datos y arranque de la app.
```

## Decisiones Que Puedes Defender

### Por Qué Separar Backend Y App

```text
Porque así la app móvil no contiene la lógica principal ni accede directamente a la base de datos. La app solo consume una API.
```

### Por Qué Usar PostgreSQL

```text
Porque el proyecto tiene muchas relaciones: usuarios con habilidades, coincidencias, conversaciones, mensajes, sesiones y valoraciones.
```

### Por Qué Usar Prisma

```text
Porque permite trabajar con la base de datos de forma tipada y más segura desde TypeScript.
```

### Por Qué Usar JWT

```text
Porque cada petición privada puede identificar al usuario sin depender de sesiones guardadas en el servidor.
```

### Por Qué Usar React Native Y Expo

```text
Porque permite desarrollar una app móvil y probarla fácilmente en navegador, emulador o móvil real.
```

### Por Qué Crear Serializadores

```text
Porque separan el modelo interno de la base de datos del contrato externo que recibe la app.
```

## Qué Mostrar Si El Profesor Pide Ver Código

Orden recomendado:

1. `prisma/schema.prisma`, para enseñar la estructura de datos.
2. `src/app.ts`, para enseñar cómo se configura la API.
3. `src/rutas/autenticacion.routes.ts`, para enseñar registro, login y JWT.
4. `src/rutas/coincidencias.routes.ts`, para enseñar la lógica principal del proyecto.
5. `src/utilidades/serializadores.ts`, para enseñar la conversión a nombres claros en español.
6. `talenttrade-app/src/navegacion/NavegadorApp.tsx`, para enseñar la navegación.
7. `talenttrade-app/src/servicios/clienteApi.ts`, para enseñar cómo la app consume el backend.
8. `talenttrade-app/src/pantallas/PantallaDescubrir.tsx`, para enseñar una pantalla conectada al backend.

Frase útil:

```text
Si tengo que resumir el código, enseñaría primero el modelo de datos, después las rutas del backend y por último una pantalla de la app consumiendo esa API.
```

## Mejoras Futuras

Estas mejoras no son necesarias para la entrega, pero se pueden mencionar si preguntan cómo continuaría el proyecto:

- Recuperación de contraseña.
- Notificaciones push.
- Subida real de avatar.
- Filtros por ciudad o categoría.
- Despliegue del backend.
- Generación de APK.
- Tests automatizados.
- Chat en tiempo real con WebSockets en cliente y servidor.

Frase útil:

```text
El proyecto ya cubre el flujo completo, y estas mejoras serían la siguiente fase si se quisiera llevar a producción.
```
