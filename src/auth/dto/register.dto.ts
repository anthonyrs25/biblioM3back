import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Simplificación académica: el rol se elige al registrarse para poder probar todos los actores.
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}