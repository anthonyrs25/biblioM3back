import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISOS = [
  { clave: 'crear_libro', descripcion: 'Crear libros en el catálogo' },
  { clave: 'editar_libro', descripcion: 'Editar libros existentes' },
  { clave: 'eliminar_libro', descripcion: 'Eliminar libros del catálogo' },
  { clave: 'ver_todos_los_prestamos', descripcion: 'Ver los préstamos de todos los usuarios' },
  { clave: 'devolver_prestamo_ajeno', descripcion: 'Registrar devoluciones de otros usuarios' },
  { clave: 'gestionar_usuarios', descripcion: 'Ver, cambiar rol y eliminar usuarios' },
  { clave: 'pedir_prestamo', descripcion: 'Solicitar préstamos de libros' },
];

// Matriz rol → permisos. Regla del profesor: SOLO el bibliotecario tiene crear_libro.
const ROLES: Record<string, string[]> = {
  ADMIN: [
    'editar_libro',
    'eliminar_libro',
    'ver_todos_los_prestamos',
    'devolver_prestamo_ajeno',
    'gestionar_usuarios',
    'pedir_prestamo',
  ],
  SUBADMIN: [
    'editar_libro',
    'ver_todos_los_prestamos',
    'devolver_prestamo_ajeno',
    'pedir_prestamo',
  ],
  BIBLIOTECARIO: [
    'crear_libro',
    'ver_todos_los_prestamos',
    'devolver_prestamo_ajeno',
    'pedir_prestamo',
  ],
  PROFESOR: ['pedir_prestamo'],
  ESTUDIANTE: ['pedir_prestamo'],
  CLIENTE: ['pedir_prestamo'],
};

async function main() {
  for (const p of PERMISOS) {
    await prisma.permiso.upsert({
      where: { clave: p.clave },
      update: { descripcion: p.descripcion },
      create: p,
    });
  }

  for (const [nombre, claves] of Object.entries(ROLES)) {
    await prisma.rol.upsert({
      where: { nombre },
      update: { permisos: { set: claves.map((clave) => ({ clave })) } },
      create: { nombre, permisos: { connect: claves.map((clave) => ({ clave })) } },
    });
  }

  // El primer admin nace por seed (nadie puede registrarse como admin)
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'roberto.salazar@biblio.com' },
    update: {},
    create: {
      nombre: 'Roberto Salazar',
      email: 'roberto.salazar@biblio.com',
      password: hash,
      rol: { connect: { nombre: 'ADMIN' } },
    },
  });

  console.log('✅ Seed completado: permisos, roles y admin inicial');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());