import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requeridos = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requeridos || requeridos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // El corazón del RBAC: consulta usuario → rol → permisos en la BASE DE DATOS
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.userId },
      include: { rol: { include: { permisos: true } } },
    });
    const clavesDelUsuario = usuario?.rol.permisos.map((p) => p.clave) ?? [];

    return requeridos.every((permiso) => clavesDelUsuario.includes(permiso));
  }
}