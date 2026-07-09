import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Rol } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
  }

  async update(id: number, data: { nombre?: string; rol?: Rol }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  async remove(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    await this.prisma.prestamo.deleteMany({ where: { usuarioId: id } });
    return this.prisma.usuario.delete({ where: { id } });
  }
}