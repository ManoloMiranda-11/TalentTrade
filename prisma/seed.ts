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

const usuariosDemo = [
  {
    email: "ana.garcia@talenttrade.es",
    nombre: "Ana García",
    contrasena: "123456",
    biografia: "Desarrolladora desde hace años. Me gusta enseñar con ejemplos pequeños y aprender idiomas a base de practicar.",
    ciudad: "Madrid",
    ofrece: { habilidad: "Programación", nivel: "ADVANCED" as const },
    quiere: { habilidad: "Inglés", nivel: "INTERMEDIATE" as const }
  },
  {
    email: "carlos.martin@talenttrade.es",
    nombre: "Carlos Martín",
    contrasena: "123456",
    biografia: "Profe de inglés con experiencia online. Estoy aprendiendo a programar para automatizar mis clases.",
    ciudad: "Valencia",
    ofrece: { habilidad: "Inglés", nivel: "ADVANCED" as const },
    quiere: { habilidad: "Programación", nivel: "BEGINNER" as const }
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
    const habilidadOfrecida = habilidadesPorNombre.get(datosUsuario.ofrece.habilidad);
    const habilidadDeseada = habilidadesPorNombre.get(datosUsuario.quiere.habilidad);

    if (!habilidadOfrecida || !habilidadDeseada) {
      throw new Error(`Faltan habilidades para el usuario demo ${datosUsuario.email}.`);
    }

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

    await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId: usuario.id,
          skillId: habilidadOfrecida.id,
          type: "OFFER"
        }
      },
      update: { level: datosUsuario.ofrece.nivel },
      create: {
        userId: usuario.id,
        skillId: habilidadOfrecida.id,
        type: "OFFER",
        level: datosUsuario.ofrece.nivel
      }
    });

    await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId: usuario.id,
          skillId: habilidadDeseada.id,
          type: "WANT"
        }
      },
      update: { level: datosUsuario.quiere.nivel },
      create: {
        userId: usuario.id,
        skillId: habilidadDeseada.id,
        type: "WANT",
        level: datosUsuario.quiere.nivel
      }
    });
  }

  console.log(`Seed: ${usuariosDemo.length} usuarios demo listos (Ana y Carlos).`);
}

async function cargarCoincidenciaDemo() {
  const [ana, carlos] = await Promise.all([
    prisma.user.findUnique({ where: { email: "ana.garcia@talenttrade.es" } }),
    prisma.user.findUnique({ where: { email: "carlos.martin@talenttrade.es" } })
  ]);

  if (!ana || !carlos) {
    return;
  }

  const programacion = await prisma.skill.findUnique({ where: { name: "Programación" } });
  const ingles = await prisma.skill.findUnique({ where: { name: "Inglés" } });

  if (!programacion || !ingles) {
    return;
  }

  const coincidencia = await prisma.match.upsert({
    where: {
      requesterId_receiverId_requesterOfferSkillId_requesterWantSkillId: {
        requesterId: ana.id,
        receiverId: carlos.id,
        requesterOfferSkillId: programacion.id,
        requesterWantSkillId: ingles.id
      }
    },
    update: { status: "ACCEPTED" },
    create: {
      requesterId: ana.id,
      receiverId: carlos.id,
      requesterOfferSkillId: programacion.id,
      requesterWantSkillId: ingles.id,
      status: "ACCEPTED"
    }
  });

  await prisma.conversation.upsert({
    where: { matchId: coincidencia.id },
    update: {},
    create: { matchId: coincidencia.id }
  });

  console.log("Seed: coincidencia aceptada entre Ana y Carlos preparada para la demo.");
}

async function ejecutarSeed() {
  await cargarHabilidadesIniciales();
  await cargarUsuariosDemo();
  await cargarCoincidenciaDemo();
}

ejecutarSeed()
  .catch((errorCapturado) => {
    console.error("Error al ejecutar el seed:", errorCapturado);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
