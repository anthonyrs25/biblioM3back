import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';

@Controller('libros')
export class LibrosController {
  constructor(private librosService: LibrosService) {}

  // Solo quien tenga el permiso 'crear_libro' en la base (BIBLIOTECARIO)
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('crear_libro')
  @Post()
  create(@Body() dto: CreateLibroDto) {
    return this.librosService.create(dto);
  }

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

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('editar_libro')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLibroDto>) {
    return this.librosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('eliminar_libro')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }
}