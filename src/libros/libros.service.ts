import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibroDto } from './dto/create-libro.dto';

@Injectable()
export class LibrosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLibroDto) {
    return this.prisma.libro.create({
      data: { ...dto, copiasDisponibles: dto.copiasTotales },
    });
  }

  // Regla: buscar por (nombre/título, año, autor, editorial)
  findAll(titulo?: string, autor?: string, editorial?: string, anio?: string) {
    return this.prisma.libro.findMany({
      where: {
        ...(titulo && { titulo: { contains: titulo, mode: 'insensitive' } }),
        ...(autor && { autor: { contains: autor, mode: 'insensitive' } }),
        ...(editorial && {
          editorial: { contains: editorial, mode: 'insensitive' },
        }),
        ...(anio && { anio: Number(anio) }),
      },
      orderBy: { titulo: 'asc' },
    });
  }

  async findOne(id: number) {
    const libro = await this.prisma.libro.findUnique({ where: { id } });
    if (!libro) throw new NotFoundException('Libro no encontrado');
    return libro;
  }

  async update(id: number, data: Partial<CreateLibroDto>) {
    await this.findOne(id);
    return this.prisma.libro.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.libro.delete({ where: { id } });
  }
}