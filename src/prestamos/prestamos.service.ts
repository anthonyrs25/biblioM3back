import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';

const COSTO_BASE = 2.0;      // Cliente paga tarifa completa
const DIAS_PRESTAMO = 10;    // Regla: préstamo solo 10 días
const MULTA_POR_DIA = 0.5;   // Regla: multa por retraso
const MAX_ACTIVOS = 3;       // Regla: máximo 3 préstamos activos

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  async create(usuarioId: number, rol: string, dto: CreatePrestamoDto) {
    // Regla: ningún usuario puede tener más de 3 préstamos activos
    const activos = await this.prisma.prestamo.count({
      where: { usuarioId, estado: 'ACTIVO' },
    });
    if (activos >= MAX_ACTIVOS) {
      throw new BadRequestException(
        `No puedes tener más de ${MAX_ACTIVOS} préstamos activos`,
      );
    }

    const libro = await this.prisma.libro.findUnique({
      where: { id: dto.libroId },
    });
    if (!libro) throw new NotFoundException('Libro no encontrado');
    if (libro.copiasDisponibles < 1) {
      throw new BadRequestException('No hay copias disponibles de este libro');
    }

    // Regla: profesores gratis, estudiantes 50% de descuento
    let costo = COSTO_BASE;
    if (rol === 'PROFESOR') costo = 0;
    else if (rol === 'ESTUDIANTE') costo = COSTO_BASE * 0.5;

    const fechaLimite = new Date(
      Date.now() + DIAS_PRESTAMO * 24 * 60 * 60 * 1000,
    );

    const [prestamo] = await this.prisma.$transaction([
      this.prisma.prestamo.create({
        data: {
          usuarioId,
          libroId: dto.libroId,
          tipoDocumento: dto.tipoDocumento,
          fechaLimite,
          costo,
        },
        include: { libro: true },
      }),
      this.prisma.libro.update({
        where: { id: dto.libroId },
        data: { copiasDisponibles: { decrement: 1 } },
      }),
    ]);

    return prestamo;
  }

  // Regla: registrar la devolución (calcula multa si hay retraso)
  async devolver(prestamoId: number, usuarioId: number, rol: string) {
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
    });
    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');
    if (prestamo.estado !== 'ACTIVO') {
      throw new BadRequestException('Este préstamo ya fue devuelto');
    }

    const esStaff = ['ADMIN', 'SUBADMIN', 'BIBLIOTECARIO'].includes(rol);
    if (!esStaff && prestamo.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes devolver un préstamo ajeno');
    }

    const hoy = new Date();
    let multa = 0;
    if (hoy > prestamo.fechaLimite) {
      const diasRetraso = Math.ceil(
        (hoy.getTime() - prestamo.fechaLimite.getTime()) / (24 * 60 * 60 * 1000),
      );
      multa = diasRetraso * MULTA_POR_DIA;
    }

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.prestamo.update({
        where: { id: prestamoId },
        data: { fechaDevolucion: hoy, multa, estado: 'DEVUELTO' },
        include: { libro: true },
      }),
      this.prisma.libro.update({
        where: { id: prestamo.libroId },
        data: { copiasDisponibles: { increment: 1 } },
      }),
    ]);

    return actualizado;
  }

  findMine(usuarioId: number) {
    return this.prisma.prestamo.findMany({
      where: { usuarioId },
      include: { libro: true },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  findAll() {
    return this.prisma.prestamo.findMany({
      include: {
        libro: true,
        usuario: { select: { id: true, nombre: true, email: true, rol: true } },
      },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }
}