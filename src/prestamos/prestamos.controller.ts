import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Post,
  Request, UseGuards,
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestConUsuario } from '../auth/interfaces/request-con-usuario';


@UseGuards(JwtAuthGuard)
@Controller('prestamos')
export class PrestamosController {
  constructor(private prestamosService: PrestamosService) { }

  // Regla: pedir libro / crear préstamo
  @Post()
  create(@Request() req: RequestConUsuario, @Body() dto: CreatePrestamoDto) {
    return this.prestamosService.create(req.user.userId, req.user.rol, dto);
  }

  @Get('mios')
  findMine(@Request() req: RequestConUsuario) {
    return this.prestamosService.findMine(req.user.userId);
  }

  // Staff ve todos los préstamos
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUBADMIN', 'BIBLIOTECARIO')
  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  // Regla: devolver libro / registrar devolución
  @Patch(':id/devolver')
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestConUsuario,
  ) {
    return this.prestamosService.devolver(id, req.user.userId, req.user.rol);
  }
}