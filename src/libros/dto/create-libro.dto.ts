import { IsInt, IsString, Min } from 'class-validator';

export class CreateLibroDto {
  @IsString()
  titulo: string;

  @IsString()
  autor: string;

  @IsString()
  editorial: string;

  @IsInt()
  anio: number;

  @IsInt()
  @Min(1)
  copiasTotales: number;
}