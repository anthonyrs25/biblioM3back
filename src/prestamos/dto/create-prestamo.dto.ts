import { IsEnum, IsInt } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class CreatePrestamoDto {
  @IsInt()
  libroId: number;

  // Regla: registrar qué tipo de documento se entrega para el préstamo
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;
}