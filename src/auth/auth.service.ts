import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {}
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: { nombre: dto.nombre, email: dto.email, password: hash, rol: dto.rol },
    });
    return this.generarToken(usuario.id, usuario.email, usuario.rol, usuario.nombre);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valida = await bcrypt.compare(dto.password, usuario.password);
    if (!valida) throw new UnauthorizedException('Credenciales inválidas');

    return this.generarToken(usuario.id, usuario.email, usuario.rol, usuario.nombre);
  }

  private generarToken(sub: number, email: string, rol: string, nombre: string) {
    const payload = { sub, email, rol };
    return {
      access_token: this.jwt.sign(payload),
      usuario: { id: sub, nombre, email, rol },
    };
  }
}