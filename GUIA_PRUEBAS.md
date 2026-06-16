# Guía De Pruebas

Esta guía sirve para comprobar TalentTrade de principio a fin antes de presentarlo. Incluye pruebas técnicas, pruebas desde la app y pruebas manuales de la API.

Para preparar la demo en sí, usa también [GUIA_PRESENTACION.md](./GUIA_PRESENTACION.md).

Para explicar las decisiones técnicas durante la defensa, usa [MEMORIA_TECNICA.md](./MEMORIA_TECNICA.md).

## 0. Objetivo De La Prueba

Al terminar esta guía debería quedar demostrado que TalentTrade permite:

- Crear usuarios.
- Iniciar sesión.
- Editar perfil.
- Añadir habilidades ofrecidas y deseadas.
- Crear disponibilidad.
- Encontrar coincidencias compatibles.
- Crear y aceptar solicitudes de intercambio.
- Usar el chat.
- Programar una sesión.
- Completar una sesión.
- Crear una valoración.

## 1. Comprobaciones Técnicas Iniciales

Desde la raíz del proyecto:

```powershell
cd C:\Users\mmira\Documents\TalentTrade
```

Comprueba que el backend pasa el chequeo de tipos:

```powershell
npm run typecheck
```

Resultado esperado:

```text
tsc --noEmit sin errores
```

Comprueba que el backend compila:

```powershell
npm run build
```

Resultado esperado:

```text
tsc -p tsconfig.json sin errores
```

Comprueba TypeScript de la app:

```powershell
cd C:\Users\mmira\Documents\TalentTrade\talenttrade-app
npm run typecheck
```

Vuelve a la raíz:

```powershell
cd C:\Users\mmira\Documents\TalentTrade
```

## 2. Preparar Base De Datos

Abre Docker Desktop.

Levanta PostgreSQL:

```powershell
docker compose up -d
```

Comprueba el estado:

```powershell
docker compose ps
```

Si es la primera vez en ese ordenador, ejecuta la migración:

```powershell
npx prisma migrate dev --name init
```

Carga los datos iniciales:

```powershell
npm run prisma:seed
```

Resultado esperado:

```text
Seed: 30 habilidades cargadas.
Seed: 2 usuarios demo listos (Ana y Carlos).
Seed: coincidencia aceptada entre Ana y Carlos preparada para la demo.
```

El seed deja preparado:

- 30 habilidades en el catálogo.
- Usuario Ana García (`ana.garcia@talenttrade.es` / `123456`, Madrid, ofrece Programación, quiere aprender Inglés).
- Usuario Carlos Martín (`carlos.martin@talenttrade.es` / `123456`, Valencia, ofrece Inglés, quiere aprender Programación).
- Coincidencia aceptada entre ambos con conversación creada.

## 3. Arrancar El Backend

En una terminal desde la raíz:

```powershell
npm run dev
```

Deja esa terminal abierta.

Comprueba la API en el navegador:

```text
http://localhost:4000/salud
```

Resultado esperado:

```json
{
  "estado": "ok",
  "servicio": "TalentTrade"
}
```

Comprueba también el catálogo de habilidades:

```text
http://localhost:4000/api/habilidades
```

Resultado esperado:

```text
Debe devolver una lista de 30 habilidades.
```

## 4. Arrancar La App

En otra terminal:

```powershell
cd C:\Users\mmira\Documents\TalentTrade\talenttrade-app
npm start
```

Opciones:

- Pulsa `w` para abrirla en navegador.
- Pulsa `a` si tienes emulador Android.
- Escanea el código QR con Expo Go si usas móvil físico.

Si usas móvil físico y no conecta, revisa la IP en:

```text
talenttrade-app/src/configuracion/configuracionApi.ts
```

En móvil físico normalmente debe usarse la IP local del ordenador, no `localhost`.

## 5. Demo Rápida Con Ana Y Carlos Del Seed

Esta prueba sirve para comprobar el flujo principal en pocos minutos usando los usuarios que crea el seed.

### 5.1 Entrar Como Ana

- [ ] Pantalla de inicio de sesión.
- [ ] Correo: `ana.garcia@talenttrade.es`.
- [ ] Contraseña: `123456`.
- [ ] Pulsa `Entrar`.

Resultado esperado:

```text
Ana entra y se muestran las pestañas principales.
```

### 5.2 Ver Perfil De Ana

En `Perfil`:

- [ ] Comprueba que aparece Ana García con su ciudad y biografía.
- [ ] Comprueba que ofrece Programación (Avanzado).
- [ ] Comprueba que quiere aprender Inglés (Medio).

Captura recomendada:

```text
Perfil de Ana con sus habilidades.
```

### 5.3 Revisar Coincidencia Aceptada

En `Coincidencias`:

- [ ] Comprueba que existe una coincidencia aceptada con Carlos.
- [ ] Pulsa `Abrir chat`.
- [ ] Envía un mensaje, por ejemplo: `Hola Carlos, ¿podemos organizar una sesión esta semana?`
- [ ] Sal y vuelve a entrar al chat para comprobar que el mensaje se guarda.

Captura recomendada:

```text
Chat con un mensaje enviado.
```

### 5.4 Programar Una Sesión

Vuelve a `Coincidencias`, dentro de la coincidencia aceptada:

- [ ] Busca el bloque `Programar sesión`.
- [ ] Pulsa el selector de fecha y elige una fecha futura.
- [ ] Pulsa el selector de hora y elige una hora.
- [ ] Comprueba que la duración está en `60` minutos.
- [ ] Pulsa la opción de crear sesión que corresponda (enseñar Programación o aprender Inglés).

Resultado esperado:

```text
La app confirma que la sesión se ha creado y aparece en la pantalla de sesiones.
```

Captura recomendada:

```text
Bloque de programación de sesión con el date picker abierto.
```

### 5.5 Completar Sesión Y Valorar

En `Sesiones`:

- [ ] Pulsa `Completar` en la sesión recién creada.
- [ ] Comprueba que el estado cambia a `Completada`.
- [ ] En el bloque de valoración, elige `5` estrellas.
- [ ] Comentario: `Muy buena experiencia.`
- [ ] Pulsa `Enviar valoración`.

Resultado esperado:

```text
La valoración se guarda y aparece en valoraciones enviadas.
```

Captura recomendada:

```text
Sesión completada con la valoración enviada.
```

## 6. Prueba Desde Cero Con Un Tercer Usuario

Esta prueba sirve para demostrar que las coincidencias no están fijadas a mano, sino que se calculan a partir de las habilidades.

### 6.1 Crear Usuario Laura

Datos sugeridos:

```text
Nombre: Laura Sánchez
Correo: laura.sanchez@talenttrade.es
Contraseña: 123456
Ciudad: Sevilla
Biografía: Me gusta practicar idiomas y aprender tecnología con ejemplos sencillos.
```

En la app:

- [ ] Cierra sesión si estabas con Ana.
- [ ] Pantalla de crear cuenta.
- [ ] Rellena nombre, correo y contraseña.
- [ ] Pulsa `Crear cuenta`.

Resultado esperado:

```text
Laura queda autenticada y se muestran las pestañas principales.
```

### 6.2 Completar Perfil

En `Perfil`:

- [ ] Cambia ciudad a `Sevilla`.
- [ ] Escribe la biografía.
- [ ] Pulsa `Guardar cambios`.

### 6.3 Añadir Habilidades

En `Habilidades`:

- [ ] Selecciona `Ofrecer`.
- [ ] Nivel `Avanzado`.
- [ ] Busca y añade `Inglés`.
- [ ] Selecciona `Aprender`.
- [ ] Nivel `Inicial`.
- [ ] Busca y añade `Programación`.

### 6.4 Crear Disponibilidad

En `Perfil`, bloque `Disponibilidad`:

- [ ] Selecciona `Lunes`.
- [ ] Pulsa `Desde` y elige `18:00` en el selector.
- [ ] Pulsa `Hasta` y elige `20:00` en el selector.
- [ ] Pulsa `Añadir disponibilidad`.

Resultado esperado:

```text
Aparece Lunes de 18:00 a 20:00 en la lista de huecos.
```

### 6.5 Descubrir Coincidencias

- [ ] Abre `Descubrir`.
- [ ] Comprueba que aparece Ana como propuesta compatible.

Si no aparece:

- Revisa que Laura ofrezca Inglés y quiera aprender Programación.
- Revisa que Ana siga teniendo sus habilidades.
- Comprueba que no exista ya una coincidencia entre Ana y Laura.

### 6.6 Proponer Intercambio

- [ ] Desde la propuesta compatible, pulsa `Proponer intercambio`.
- [ ] Abre `Coincidencias`.
- [ ] Comprueba que aparece como `Pendiente`.

### 6.7 Aceptar Solicitud Con Ana

- [ ] Cierra sesión.
- [ ] Entra con Ana.
- [ ] Abre `Coincidencias`.
- [ ] Acepta la solicitud de Laura.

Resultado esperado:

```text
La coincidencia pasa a Aceptada y aparece la opción de abrir chat.
```

## 7. Pruebas Desde La API

También puedes probar el backend sin la app, usando el archivo:

```text
pruebas/talenttrade.http
```

Recomendación:

```text
Usa la extensión REST Client de VS Code.
```

Orden recomendado:

1. Ejecuta `Estado del servicio`.
2. Inicia sesión con Ana y copia el token en `@tokenPrincipal`.
3. Inicia sesión con Carlos y copia el token en `@tokenOtraPersona`.
4. Ejecuta `Listar habilidades` y copia los ids relevantes en las variables de cabecera.
5. Ejecuta `Listar coincidencias de Ana` y copia el `coincidenciaId`, `conversacionId`, `profesorId` y `aprendizId`.
6. Envía mensajes con `Enviar mensaje`.
7. Crea una sesión con `Crear sesion`.
8. Completa la sesión con `Completar sesion`.
9. Crea una valoración con `Crear valoracion`.

Resultado esperado:

```text
Las respuestas devuelven 200 o 201 en las operaciones correctas.
```

Errores controlados normales si la prueba se repite:

```text
409 Ya existe una coincidencia para este intercambio.
```

## 8. Casos De Error Recomendados

Estas pruebas ayudan a demostrar las validaciones:

- [ ] Intentar iniciar sesión con contraseña incorrecta.
- [ ] Intentar crear una cuenta con un correo ya usado.
- [ ] Intentar entrar a una ruta privada sin token desde el archivo HTTP.
- [ ] Intentar crear una disponibilidad con hora final anterior a la hora inicial.
- [ ] Intentar programar una sesión con fecha pasada.
- [ ] Intentar enviar un mensaje vacío.
- [ ] Intentar valorar una sesión que no está completada.

Resultado esperado:

```text
La app o la API muestra un mensaje de error controlado y no se rompe.
```

## 9. Problemas Frecuentes

### La API No Responde

Comprueba que la terminal del backend siga abierta:

```powershell
npm run dev
```

Y prueba:

```text
http://localhost:4000/salud
```

### La Base De Datos No Responde

```powershell
docker compose up -d
docker compose ps
```

### Faltan Habilidades O Usuarios Demo

```powershell
npm run prisma:seed
```

### La App No Conecta

- Comprueba que el backend esté abierto.
- Comprueba la URL en `talenttrade-app/src/configuracion/configuracionApi.ts`.
- En navegador usa `localhost`.
- En emulador Android usa `10.0.2.2`.
- En móvil físico usa la IP local del ordenador.

### No Aparecen Coincidencias

- Un usuario debe ofrecer lo que el otro quiere aprender.
- El otro usuario debe querer aprender lo que el primero ofrece.
- Ambos deben tener al menos una habilidad ofrecida y una deseada.
- Si ya existe una coincidencia idéntica, crea un usuario nuevo para probar desde cero.

## 10. Checklist Final Antes De Presentar

Antes de dar la prueba por buena:

- [ ] El backend compila (`npm run build`).
- [ ] La app compila (`npm run typecheck` en `talenttrade-app/`).
- [ ] `docker compose ps` muestra PostgreSQL activo.
- [ ] `http://localhost:4000/salud` responde.
- [ ] `npm run dev` está abierto.
- [ ] `npm start` está abierto en la app.
- [ ] El seed ha cargado 30 habilidades y los dos usuarios demo.
- [ ] Puedes entrar con Ana y con Carlos.
- [ ] Hay una coincidencia aceptada entre Ana y Carlos.
- [ ] El chat guarda mensajes.
- [ ] Se puede crear disponibilidad con el date picker.
- [ ] Se puede programar una sesión con el date picker.
- [ ] Se puede completar una sesión.
- [ ] Se puede valorar.
- [ ] Tienes capturas para la memoria.

## 11. Capturas Mínimas Para La Memoria

Incluye al menos:

- Login o registro.
- Perfil completado.
- Habilidades ofrecidas y deseadas.
- Descubrir con coincidencia compatible.
- Coincidencia pendiente o aceptada.
- Chat con mensajes.
- Programar sesión (con el date picker visible).
- Sesión completada.
- Valoración enviada.
- Modelo de base de datos o `schema.prisma`.
