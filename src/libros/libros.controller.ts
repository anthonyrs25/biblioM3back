import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('libros')
export class LibrosController {
  constructor(private librosService: LibrosService) {}

  // Regla: solo el bibliotecario crea libros (el admin tiene acceso a todo)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BIBLIOTECARIO', 'ADMIN')
  @Post()
  create(@Body() dto: CreateLibroDto) {
    return this.librosService.create(dto);
  }

  // Público: ver libros y disponibilidad, con búsqueda
  @Get()
  findAll(
    @Query('titulo') titulo?: string,
    @Query('autor') autor?: string,
    @Query('editorial') editorial?: string,
    @Query('anio') anio?: string,
  ) {
    return this.librosService.findAll(titulo, autor, editorial, anio);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUBADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLibroDto>) {
    return this.librosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }
}