# Guia De Presentacion

Esta guia sirve como chuleta para ensenar TalentTrade sin tener que improvisar. La idea es arrancar primero todo con calma, comprobar que funciona y despues seguir el guion de la demo.

Para una explicacion mas tecnica de que se ha usado, por que y donde esta cada parte, usa tambien [MEMORIA_TECNICA.md](./MEMORIA_TECNICA.md).

## Idea Del Proyecto

TalentTrade es una aplicacion para intercambiar habilidades entre personas. Una persona indica que puede ensenar, que quiere aprender y la aplicacion le propone usuarios compatibles.

Ejemplo sencillo:

- Ana ofrece programacion y quiere aprender ingles.
- Carlos ofrece ingles y quiere aprender programacion.
- La aplicacion detecta que encajan, permite proponer una coincidencia, abrir chat, programar una sesion y valorar la experiencia.

Frase corta para explicarlo:

```text
TalentTrade es una app movil para conectar personas que quieren intercambiar conocimientos, con backend propio, autenticacion, coincidencias, chat, sesiones y valoraciones.
```

## Antes De Empezar

Comprueba que tienes abierto el proyecto en VS Code:

```powershell
cd C:\Users\mmira\Documents\TalentTrade
```

Comprueba que Docker esta abierto si vas a usar PostgreSQL con Docker.

## Arrancar El Backend

Desde la raiz del proyecto:

```powershell
docker compose up -d
```

Comprueba que la base de datos esta levantada:

```powershell
docker compose ps
```

Si es la primera vez en ese ordenador, ejecuta la migracion:

```powershell
npx prisma migrate dev --name init
```

Carga los datos iniciales:

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

Si responde correctamente, el backend esta listo.

## Arrancar La App

Abre otra terminal y entra en la app:

```powershell
cd C:\Users\mmira\Documents\TalentTrade\talenttrade-app
```

Arranca Expo:

```powershell
npm start
```

Opciones para ensenar la app:

- Pulsa `w` para abrirla en navegador.
- Pulsa `a` si tienes emulador Android.
- Escanea el QR con Expo Go si usas movil fisico.

Si usas movil fisico y no conecta, revisa la IP en:

```text
talenttrade-app/src/configuracion/configuracionApi.ts
```

## Usuarios Preparados

Puedes entrar directamente con estos usuarios:

```text
Ana Garcia
Correo: ana.garcia@talenttrade.es
Contrasena: 123456
Ciudad: Madrid
Ofrece: Programacion
Quiere aprender: Ingles
```

```text
Carlos Martin
Correo: carlos.martin@talenttrade.es
Contrasena: 123456
Ciudad: Valencia
Ofrece: Ingles
Quiere aprender: Programacion
```

Estos usuarios sirven para hacer una demo rapida porque ya tienen datos realistas.

## Demo Rapida Con Ana Y Carlos

1. Entra con Ana.
2. Muestra el perfil, la biografia, las habilidades y la disponibilidad.
3. Entra en Coincidencias para ver que existe una relacion aceptada.
4. Abre el chat y envia un mensaje corto.
5. Entra en Sesiones y muestra el seguimiento de las sesiones.
6. Explica que la valoracion se hace despues de completar una sesion.

Frase util:

```text
Aqui se ve el flujo principal ya preparado: dos usuarios compatibles, una coincidencia aceptada, conversacion y gestion de sesiones.
```

## Demo Desde Cero Con Un Tercer Usuario

Para ensenar que no esta todo fijo, crea un tercer usuario durante la presentacion:

```text
Nombre: Laura Sanchez
Correo: laura.sanchez@talenttrade.es
Contrasena: 123456
Ciudad: Sevilla
Biografia: Me gusta practicar idiomas y aprender tecnologia con ejemplos sencillos.
```

Habilidades recomendadas:

- Ofrece: Ingles, nivel Avanzado.
- Quiere aprender: Programacion, nivel Inicial.

Despues:

1. Guarda el perfil de Laura.
2. Anade sus habilidades.
3. Ve a Descubrir.
4. Muestra como aparece una propuesta compatible.
5. Crea la propuesta de intercambio.
6. Entra con Ana o Carlos para ensenar la otra parte del flujo.

Frase util:

```text
Esto demuestra que las coincidencias no estan escritas a mano, sino que salen de comparar lo que una persona ofrece con lo que otra quiere aprender.
```

## Puntos Tecnicos A Destacar

- El backend esta hecho con Node.js, Express y TypeScript.
- La base de datos es PostgreSQL y se gestiona con Prisma.
- El inicio de sesion usa JWT.
- La app movil esta hecha con Expo y React Native.
- La navegacion usa pestanas y pantallas separadas.
- Las llamadas a la API estan centralizadas en servicios.
- El proyecto separa rutas, utilidades, intermediarios, pantallas, componentes y tipos.
- El contrato externo de la API usa nombres en espanol para que sea mas legible.

Frase util:

```text
He intentado separar bien el proyecto para que no sea solo una demo visual: hay backend, base de datos, autenticacion, logica de coincidencias y una app consumiendo esa API.
```

## Si Te Preguntan Por La Base De Datos

Puedes explicar:

```text
La base de datos guarda usuarios, habilidades, habilidades de cada usuario, coincidencias, conversaciones, mensajes, disponibilidad, sesiones y valoraciones.
```

Idea importante:

```text
La coincidencia se produce cuando lo que un usuario quiere aprender coincide con lo que otro usuario ofrece, y al reves.
```

## Si Algo Falla Durante La Presentacion

Si la app no conecta con el backend:

- Comprueba que `npm run dev` sigue abierto en la terminal del backend.
- Entra en `http://localhost:4000/salud`.
- Si usas movil fisico, revisa que la IP de la app sea la IP local del ordenador.

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
2. Explica la solucion: intercambiar habilidades sin pagar clases.
3. Ensena el login y el perfil.
4. Ensena habilidades ofrecidas y habilidades que quiere aprender.
5. Ensena Descubrir y Coincidencias.
6. Ensena el chat.
7. Ensena sesiones y valoraciones.
8. Cierra con la parte tecnica.

## Cierre De La Presentacion

Frase final:

```text
TalentTrade cubre un flujo completo: registro, perfil, habilidades, busqueda de personas compatibles, coincidencias, chat, sesiones y valoraciones. Es una base funcional que se podria ampliar con notificaciones, recuperacion de contrasena, filtros avanzados o despliegue en produccion.
```
