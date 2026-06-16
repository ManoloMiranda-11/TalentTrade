import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const habilidadesIniciales = [
  { name: "Programación", category: "Tecnología", icon: "code" },
  { name: "React", category: "Tecnología", icon: "atom" },
  { name: "Node.js", category: "Tecnología", icon: "server" },
  { name: "SQL", category: "Tecnología", icon: "database" },
  { name: "Diseño UX/UI", category: "Tecnología", icon: "palette" },
  { name: "Photoshop", category: "Creatividad", icon: "image" },
  { name: "Fotografía", category: "Creatividad", icon: "camera" },
  { name: "Edición de vídeo", category: "Creatividad", icon: "video" },
  { name: "Guitarra", category: "Música", icon: "music" },
  { name: "Piano", category: "Música", icon: "piano" },
  { name: "Canto", category: "Música", icon: "mic" },
  { name: "Inglés", category: "Idiomas", icon: "languages" },
  { name: "Francés", category: "Idiomas", icon: "languages" },
  { name: "Alemán", category: "Idiomas", icon: "languages" },
  { name: "Italiano", category: "Idiomas", icon: "languages" },
  { name: "Cocina", category: "Hogar", icon: "chef-hat" },
  { name: "Repostería", category: "Hogar", icon: "cake" },
  { name: "Nutrición", category: "Bienestar", icon: "apple" },
  { name: "Yoga", category: "Bienestar", icon: "activity" },
  { name: "Meditación", category: "Bienestar", icon: "sparkles" },
  { name: "Entrenamiento personal", category: "Bienestar", icon: "dumbbell" },
  { name: "Ajedrez", category: "Ocio", icon: "crown" },
  { name: "Dibujo", category: "Creatividad", icon: "pencil" },
  { name: "Pintura", category: "Creatividad", icon: "brush" },
  { name: "Costura", category: "Manualidades", icon: "scissors" },
  { name: "Manualidades", category: "Manualidades", icon: "hammer" },
  { name: "Oratoria", category: "Desarrollo personal", icon: "message-square" },
  { name: "Marketing digital", category: "Negocios", icon: "megaphone" },
  { name: "Finanzas personales", category: "Negocios", icon: "wallet" },
  { name: "Excel", category: "Productividad", icon: "sheet" }
];

type NivelHabilidad = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface HabilidadUsuarioDemo {
  habilidad: string;
  nivel: NivelHabilidad;
}

interface UsuarioDemo {
  email: string;
  nombre: string;
  contrasena: string;
  biografia: string;
  ciudad: string;
  ofrece: HabilidadUsuarioDemo[];
  quiere: HabilidadUsuarioDemo[];
}

// Ana es la usuaria principal de la demostración. El resto de perfiles están
// diseñados a su alrededor: unos encajan con ella pero aún no tienen
// coincidencia (para que la pantalla "Descubrir" tenga propuestas que mostrar)
// y otros ya tienen una coincidencia creada (para la pantalla "Coincidencias").
const usuariosDemo: UsuarioDemo[] = [
  {
    email: "ana.garcia@talenttrade.es",
    nombre: "Ana García",
    contrasena: "123456",
    biografia: "Desarrolladora desde hace años. Me gusta enseñar con ejemplos pequeños y aprender idiomas a base de practicar.",
    ciudad: "Madrid",
    ofrece: [
      { habilidad: "Programación", nivel: "ADVANCED" },
      { habilidad: "Diseño UX/UI", nivel: "INTERMEDIATE" }
    ],
    quiere: [
      { habilidad: "Inglés", nivel: "INTERMEDIATE" },
      { habilidad: "Fotografía", nivel: "BEGINNER" },
      { habilidad: "Guitarra", nivel: "BEGINNER" }
    ]
  },
  {
    email: "carlos.martin@talenttrade.es",
    nombre: "Carlos Martín",
    contrasena: "123456",
    biografia: "Profe de inglés con experiencia online. Estoy aprendiendo a programar para automatizar mis clases.",
    ciudad: "Valencia",
    ofrece: [{ habilidad: "Inglés", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Programación", nivel: "BEGINNER" }]
  },
  {
    email: "lucia.fernandez@talenttrade.es",
    nombre: "Lucía Fernández",
    contrasena: "123456",
    biografia: "Filóloga inglesa y traductora. Quiero dar el salto a la programación para crear mis propias herramientas.",
    ciudad: "Sevilla",
    ofrece: [{ habilidad: "Inglés", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Programación", nivel: "BEGINNER" }]
  },
  {
    email: "javier.ruiz@talenttrade.es",
    nombre: "Javier Ruiz",
    contrasena: "123456",
    biografia: "Fotógrafo de producto. Me encantaría aprender diseño de interfaces para montar mi propio portfolio web.",
    ciudad: "Bilbao",
    ofrece: [{ habilidad: "Fotografía", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Diseño UX/UI", nivel: "INTERMEDIATE" }]
  },
  {
    email: "marta.soler@talenttrade.es",
    nombre: "Marta Soler",
    contrasena: "123456",
    biografia: "Profesora de guitarra clásica y moderna. Busco a alguien que me enseñe a programar desde cero.",
    ciudad: "Barcelona",
    ofrece: [{ habilidad: "Guitarra", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Programación", nivel: "BEGINNER" }]
  },
  {
    email: "diego.romero@talenttrade.es",
    nombre: "Diego Romero",
    contrasena: "123456",
    biografia: "Profe de inglés de los negocios. Estoy lanzando una marca y necesito mejorar el diseño de mis pantallas.",
    ciudad: "Zaragoza",
    ofrece: [{ habilidad: "Inglés", nivel: "INTERMEDIATE" }],
    quiere: [{ habilidad: "Diseño UX/UI", nivel: "INTERMEDIATE" }]
  },
  {
    email: "sergio.navarro@talenttrade.es",
    nombre: "Sergio Navarro",
    contrasena: "123456",
    biografia: "Desarrollador backend. Quiero practicar inglés para poder trabajar en proyectos internacionales.",
    ciudad: "Málaga",
    ofrece: [{ habilidad: "Programación", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Inglés", nivel: "INTERMEDIATE" }]
  },
  {
    email: "elena.castro@talenttrade.es",
    nombre: "Elena Castro",
    contrasena: "123456",
    biografia: "Programadora full stack. Me encantaría soltarme con el inglés hablado antes de mudarme fuera.",
    ciudad: "Granada",
    ofrece: [{ habilidad: "Programación", nivel: "ADVANCED" }],
    quiere: [{ habilidad: "Inglés", nivel: "BEGINNER" }]
  }
];

type EstadoCoincidenciaDemo = "PENDING" | "ACCEPTED";

interface MensajeDemo {
  autor: string;
  texto: string;
}

interface CoincidenciaDemo {
  solicitante: string;
  receptor: string;
  habilidadOfrecida: string;
  habilidadDeseada: string;
  estado: EstadoCoincidenciaDemo;
  mensajes?: MensajeDemo[];
}

// Coincidencias preparadas para la demo:
//  - Ana ↔ Carlos: aceptada y con chat, para enseñar la conversación.
//  - Diego → Ana: pendiente, para que Ana vea los botones de aceptar/rechazar.
// Lucía, Javier y Marta NO aparecen aquí a propósito: al no tener coincidencia
// con Ana, se mantienen como propuestas en la pantalla "Descubrir".
const coincidenciasDemo: CoincidenciaDemo[] = [
  {
    solicitante: "ana.garcia@talenttrade.es",
    receptor: "carlos.martin@talenttrade.es",
    habilidadOfrecida: "Programación",
    habilidadDeseada: "Inglés",
    estado: "ACCEPTED",
    mensajes: [
      { autor: "carlos.martin@talenttrade.es", texto: "¡Hola Ana! Tengo muchas ganas de empezar con la programación." },
      { autor: "ana.garcia@talenttrade.es", texto: "¡Genial, Carlos! Yo quiero practicar inglés. ¿Te viene bien el martes a las 18:00?" },
      { autor: "carlos.martin@talenttrade.es", texto: "Perfecto, el martes a las 18:00. Preparo una clase de conversación para empezar." }
    ]
  },
  {
    solicitante: "diego.romero@talenttrade.es",
    receptor: "ana.garcia@talenttrade.es",
    habilidadOfrecida: "Inglés",
    habilidadDeseada: "Diseño UX/UI",
    estado: "PENDING"
  }
];

async function cargarHabilidadesIniciales() {
  for (const habilidad of habilidadesIniciales) {
    await prisma.skill.upsert({
      where: { name: habilidad.name },
      update: {
        category: habilidad.category,
        icon: habilidad.icon
      },
      create: habilidad
    });
  }

  console.log(`Seed: ${habilidadesIniciales.length} habilidades cargadas.`);
}

async function cargarUsuariosDemo() {
  const habilidadesPorNombre = new Map(
    (await prisma.skill.findMany()).map((habilidad) => [habilidad.name, habilidad])
  );

  for (const datosUsuario of usuariosDemo) {
    const hashContrasena = await bcrypt.hash(datosUsuario.contrasena, 10);

    const usuario = await prisma.user.upsert({
      where: { email: datosUsuario.email },
      update: {
        name: datosUsuario.nombre,
        bio: datosUsuario.biografia,
        city: datosUsuario.ciudad
      },
      create: {
        email: datosUsuario.email,
        passwordHash: hashContrasena,
        name: datosUsuario.nombre,
        bio: datosUsuario.biografia,
        city: datosUsuario.ciudad
      }
    });

    const habilidadesUsuario = [
      ...datosUsuario.ofrece.map((habilidad) => ({ ...habilidad, type: "OFFER" as const })),
      ...datosUsuario.quiere.map((habilidad) => ({ ...habilidad, type: "WANT" as const }))
    ];

    for (const habilidadUsuario of habilidadesUsuario) {
      const habilidad = habilidadesPorNombre.get(habilidadUsuario.habilidad);

      if (!habilidad) {
        throw new Error(`Falta la habilidad "${habilidadUsuario.habilidad}" para el usuario demo ${datosUsuario.email}.`);
      }

      await prisma.userSkill.upsert({
        where: {
          userId_skillId_type: {
            userId: usuario.id,
            skillId: habilidad.id,
            type: habilidadUsuario.type
          }
        },
        update: { level: habilidadUsuario.nivel },
        create: {
          userId: usuario.id,
          skillId: habilidad.id,
          type: habilidadUsuario.type,
          level: habilidadUsuario.nivel
        }
      });
    }
  }

  console.log(`Seed: ${usuariosDemo.length} usuarios demo listos.`);
}

async function cargarCoincidenciasDemo() {
  const usuariosPorEmail = new Map(
    (await prisma.user.findMany()).map((usuario) => [usuario.email, usuario])
  );
  const habilidadesPorNombre = new Map(
    (await prisma.skill.findMany()).map((habilidad) => [habilidad.name, habilidad])
  );

  // Los mensajes de demo arrancan hace una hora para que aparezcan ordenados y
  // recientes, separados un minuto entre sí.
  const baseMensajes = Date.now() - 60 * 60 * 1000;

  for (const datosCoincidencia of coincidenciasDemo) {
    const solicitante = usuariosPorEmail.get(datosCoincidencia.solicitante);
    const receptor = usuariosPorEmail.get(datosCoincidencia.receptor);
    const habilidadOfrecida = habilidadesPorNombre.get(datosCoincidencia.habilidadOfrecida);
    const habilidadDeseada = habilidadesPorNombre.get(datosCoincidencia.habilidadDeseada);

    if (!solicitante || !receptor || !habilidadOfrecida || !habilidadDeseada) {
      throw new Error(
        `No se pudo preparar la coincidencia demo entre ${datosCoincidencia.solicitante} y ${datosCoincidencia.receptor}.`
      );
    }

    const coincidencia = await prisma.match.upsert({
      where: {
        requesterId_receiverId_requesterOfferSkillId_requesterWantSkillId: {
          requesterId: solicitante.id,
          receiverId: receptor.id,
          requesterOfferSkillId: habilidadOfrecida.id,
          requesterWantSkillId: habilidadDeseada.id
        }
      },
      update: { status: datosCoincidencia.estado },
      create: {
        requesterId: solicitante.id,
        receiverId: receptor.id,
        requesterOfferSkillId: habilidadOfrecida.id,
        requesterWantSkillId: habilidadDeseada.id,
        status: datosCoincidencia.estado
      }
    });

    if (datosCoincidencia.estado !== "ACCEPTED") {
      continue;
    }

    const conversacion = await prisma.conversation.upsert({
      where: { matchId: coincidencia.id },
      update: {},
      create: { matchId: coincidencia.id }
    });

    if (!datosCoincidencia.mensajes?.length) {
      continue;
    }

    const contenidosExistentes = new Set(
      (
        await prisma.message.findMany({
          where: { conversationId: conversacion.id },
          select: { content: true }
        })
      ).map((mensaje) => mensaje.content)
    );

    for (const [indice, mensaje] of datosCoincidencia.mensajes.entries()) {
      if (contenidosExistentes.has(mensaje.texto)) {
        continue;
      }

      const autor = usuariosPorEmail.get(mensaje.autor);

      if (!autor) {
        throw new Error(`El autor "${mensaje.autor}" del mensaje demo no existe.`);
      }

      await prisma.message.create({
        data: {
          conversationId: conversacion.id,
          senderId: autor.id,
          content: mensaje.texto,
          isRead: true,
          createdAt: new Date(baseMensajes + indice * 60 * 1000)
        }
      });
    }
  }

  console.log(`Seed: ${coincidenciasDemo.length} coincidencias demo preparadas.`);
}

async function ejecutarSeed() {
  await cargarHabilidadesIniciales();
  await cargarUsuariosDemo();
  await cargarCoincidenciasDemo();
}

ejecutarSeed()
  .catch((errorCapturado) => {
    console.error("Error al ejecutar el seed:", errorCapturado);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
