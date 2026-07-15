import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Post,
  Request, UseGuards,
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import type { RequestConUsuario } from '../auth/interfaces/request-con-usuario';

@UseGuards(JwtAuthGuard)
@Controller('prestamos')
export class PrestamosController {
  constructor(private prestamosService: PrestamosService) {}

  @Post()
  create(@Request() req: RequestConUsuario, @Body() dto: CreatePrestamoDto) {
    return this.prestamosService.create(req.user.userId, req.user.rol, dto);
  }

  @Get('mios')
  findMine(@Request() req: RequestConUsuario) {
    return this.prestamosService.findMine(req.user.userId);
  }

  // Solo quien tenga el permiso 'ver_todos_los_prestamos'
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_todos_los_prestamos')
  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  @Patch(':id/devolver')
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestConUsuario,
  ) {
    return this.prestamosService.devolver(id, req.user.userId, req.user.rol);
  }
}