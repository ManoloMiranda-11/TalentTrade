import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const habilidadesIniciales = [
  { name: "Programacion", category: "Tecnologia", icon: "code" },
  { name: "React", category: "Tecnologia", icon: "atom" },
  { name: "Node.js", category: "Tecnologia", icon: "server" },
  { name: "SQL", category: "Tecnologia", icon: "database" },
  { name: "Diseno UX/UI", category: "Tecnologia", icon: "palette" },
  { name: "Photoshop", category: "Creatividad", icon: "image" },
  { name: "Fotografia", category: "Creatividad", icon: "camera" },
  { name: "Edicion de video", category: "Creatividad", icon: "video" },
  { name: "Guitarra", category: "Musica", icon: "music" },
  { name: "Piano", category: "Musica", icon: "piano" },
  { name: "Canto", category: "Musica", icon: "mic" },
  { name: "Ingles", category: "Idiomas", icon: "languages" },
  { name: "Frances", category: "Idiomas", icon: "languages" },
  { name: "Aleman", category: "Idiomas", icon: "languages" },
  { name: "Italiano", category: "Idiomas", icon: "languages" },
  { name: "Cocina", category: "Hogar", icon: "chef-hat" },
  { name: "Reposteria", category: "Hogar", icon: "cake" },
  { name: "Nutricion", category: "Bienestar", icon: "apple" },
  { name: "Yoga", category: "Bienestar", icon: "activity" },
  { name: "Meditacion", category: "Bienestar", icon: "sparkles" },
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

  console.log(`Seed completado: ${habilidadesIniciales.length} habilidades iniciales.`);
}

cargarHabilidadesIniciales()
  .catch((errorCapturado) => {
    console.error("Error al ejecutar el seed:", errorCapturado);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
