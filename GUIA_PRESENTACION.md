# Guía De Presentación

Esta guía sirve como chuleta para enseñar TalentTrade sin tener que improvisar. La idea es arrancar primero todo con calma, comprobar que funciona y después seguir el guion de la demo.

Para una explicación más técnica de qué se ha usado, por qué y dónde está cada parte, usa también [MEMORIA_TECNICA.md](./MEMORIA_TECNICA.md).

Para comprobar el proyecto antes de presentarlo, usa [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md).

## Idea Del Proyecto

TalentTrade es una aplicación para intercambiar habilidades entre personas. Una persona indica qué puede enseñar, qué quiere aprender y la aplicación le propone usuarios compatibles.

Ejemplo sencillo:

- Ana ofrece programación y quiere aprender inglés.
- Carlos ofrece inglés y quiere aprender programación.
- La aplicación detecta que encajan, permite proponer una coincidencia, abrir chat, programar una sesión y valorar la experiencia.

Frase corta para explicarlo:

```text
TalentTrade es una app móvil para conectar personas que quieren intercambiar conocimientos, con backend propio, autenticación, coincidencias, chat, sesiones y valoraciones.
```

## Antes De Empezar

Comprueba que tienes abierto el proyecto en VS Code:

```powershell
cd C:\Users\mmira\Documents\TalentTrade
```

Comprueba que Docker está abierto si vas a usar PostgreSQL con Docker.

## Arrancar El Backend

Desde la raíz del proyecto:

```powershell
docker compose up -d
```

Comprueba que la base de datos está levantada:

```powershell
docker compose ps
```

Si es la primera vez en ese ordenador, ejecuta la migración:

```powershell
npx prisma migrate dev --name init
```

Carga las habilidades iniciales y los usuarios de demo:

```powershell
npm run prisma:seed
```

Arranca la API:

```powershell
npm run dev
```

Prueba en el navegador:

```text
http://localhost:4000/salud
```

Si responde correctamente, el backend está listo.

## Arrancar La App

Abre otra terminal y entra en la app:

```powershell
cd C:\Users\mmira\Documents\TalentTrade\talenttrade-app
```

Arranca Expo:

```powershell
npm start
```

Opciones para enseñar la app:

- Pulsa `w` para abrirla en navegador.
- Pulsa `a` si tienes emulador Android.
- Escanea el código QR con Expo Go si usas móvil físico.

Si usas móvil físico y no conecta, revisa la IP en:

```text
talenttrade-app/src/configuracion/configuracionApi.ts
```

## Usuarios Preparados

Puedes entrar directamente con estos usuarios:

```text
Ana García
Correo: ana.garcia@talenttrade.es
Contraseña: 123456
Ciudad: Madrid
Ofrece: Programación
Quiere aprender: Inglés
```

```text
Carlos Martín
Correo: carlos.martin@talenttrade.es
Contraseña: 123456
Ciudad: Valencia
Ofrece: Inglés
Quiere aprender: Programación
```

Estos usuarios sirven para hacer una demo rápida porque ya tienen datos realistas.

Si en una base de datos nueva no existen, créalos desde la pantalla de registro con esos mismos datos o vuelve a ejecutar `npm run prisma:seed`.

## Demo Rápida Con Ana Y Carlos

1. Entra con Ana.
2. Muestra el perfil, la biografía, las habilidades y la disponibilidad.
3. Entra en Coincidencias para ver que existe una relación aceptada.
4. Abre el chat y envía un mensaje corto.
5. Entra en Sesiones y muestra el seguimiento de las sesiones.
6. Explica que la valoración se hace después de completar una sesión.

Frase útil:

```text
Aquí se ve el flujo principal ya preparado: dos usuarios compatibles, una coincidencia aceptada, conversación y gestión de sesiones.
```

## Demo Desde Cero Con Un Tercer Usuario

Para enseñar que no está todo fijo, crea un tercer usuario durante la presentación:

```text
Nombre: Laura Sánchez
Correo: laura.sanchez@talenttrade.es
Contraseña: 123456
Ciudad: Sevilla
Biografía: Me gusta practicar idiomas y aprender tecnología con ejemplos sencillos.
```

Habilidades recomendadas:

- Ofrece: Inglés, nivel Avanzado.
- Quiere aprender: Programación, nivel Inicial.

Después:

1. Guarda el perfil de Laura.
2. Añade sus habilidades.
3. Ve a Descubrir.
4. Muestra cómo aparece una propuesta compatible.
5. Crea la propuesta de intercambio.
6. Entra con Ana o Carlos para enseñar la otra parte del flujo.

Frase útil:

```text
Esto demuestra que las coincidencias no están escritas a mano, sino que salen de comparar lo que una persona ofrece con lo que otra quiere aprender.
```

## Puntos Técnicos A Destacar

- El backend está hecho con Node.js, Express y TypeScript.
- La base de datos es PostgreSQL y se gestiona con Prisma.
- El inicio de sesión usa JWT.
- La app móvil está hecha con Expo y React Native.
- La navegación usa pestañas y pantallas separadas.
- Las llamadas a la API están centralizadas en servicios.
- El proyecto separa rutas, utilidades, intermediarios, pantallas, componentes y tipos.
- El contrato externo de la API usa nombres en español para que sea más legible.

Frase útil:

```text
He intentado separar bien el proyecto para que no sea solo una demo visual: hay backend, base de datos, autenticación, lógica de coincidencias y una app consumiendo esa API.
```

## Si Te Preguntan Por La Base De Datos

Puedes explicar:

```text
La base de datos guarda usuarios, habilidades, habilidades de cada usuario, coincidencias, conversaciones, mensajes, disponibilidad, sesiones y valoraciones.
```

Idea importante:

```text
La coincidencia se produce cuando lo que un usuario quiere aprender coincide con lo que otro usuario ofrece, y al revés.
```

## Si Algo Falla Durante La Presentación

Si la app no conecta con el backend:

- Comprueba que `npm run dev` siga abierto en la terminal del backend.
- Entra en `http://localhost:4000/salud`.
- Si usas móvil físico, revisa que la IP de la app sea la IP local del ordenador.

Si la base de datos no responde:

```powershell
docker compose up -d
docker compose ps
```

Si faltan datos:

```powershell
npm run prisma:seed
```

Si Expo se queda raro:

```powershell
cd C:\Users\mmira\Documents\TalentTrade\talenttrade-app
npm start
```

Luego pulsa `r` para recargar.

## Orden Recomendado Para Presentar

1. Explica el problema: mucha gente sabe algo y quiere aprender otra cosa.
2. Explica la solución: intercambiar habilidades sin pagar clases.
3. Enseña el login y el perfil.
4. Enseña las habilidades ofrecidas y las que quiere aprender.
5. Enseña Descubrir y Coincidencias.
6. Enseña el chat.
7. Enseña sesiones y valoraciones.
8. Cierra con la parte técnica.

## Cierre De La Presentación

Frase final:

```text
TalentTrade cubre un flujo completo: registro, perfil, habilidades, búsqueda de personas compatibles, coincidencias, chat, sesiones y valoraciones. Es una base funcional que se podría ampliar con notificaciones, recuperación de contraseña, filtros avanzados o despliegue en producción.
```
