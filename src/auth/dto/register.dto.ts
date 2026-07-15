import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const ROLES_PUBLICOS = ['CLIENTE', 'ESTUDIANTE', 'PROFESOR'];

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(ROLES_PUBLICOS, {
    message: 'Los roles administrativos solo pueden ser asignados por un administrador',
  })
  rol?: string;
}