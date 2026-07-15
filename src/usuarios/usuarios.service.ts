import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        rol: { select: { nombre: true } },
      },
      orderBy: { id: 'asc' },
    });
    // El frontend espera rol como texto → aplanamos la relación
    return usuarios.map((u) => ({ ...u, rol: u.rol.nombre }));
  }

  async update(id: number, dto: { nombre?: string; rol?: string }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.rol) {
      const rol = await this.prisma.rol.findUnique({ where: { nombre: dto.rol } });
      if (!rol) throw new NotFoundException(`El rol ${dto.rol} no existe`);
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.rol && { rol: { connect: { nombre: dto.rol } } }),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: { select: { nombre: true } },
      },
    });
    return { ...actualizado, rol: actualizado.rol.nombre };
  }

  async remove(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    await this.prisma.prestamo.deleteMany({ where: { usuarioId: id } });
    return this.prisma.usuario.delete({ where: { id } });
  }
}