import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // Crear una nueva notificación (si ya existe del mismo tipo, se actualiza)
  @Post('create')
  create(@Body() createNotificacioneDto: CreateNotificacioneDto) {
    return this.notificacionesService.create(createNotificacioneDto);
  }

  // Obtener todas las notificaciones de un usuario (puede filtrar por leídas/no leídas)
  @Get('by-user/:toRunnerUID')
  findByToRunnerUID(
    @Param('toRunnerUID') toRunnerUID: string,
    @Query('leida') leida?: string,
  ) {
    const leidaBool = leida === 'true' ? true : leida === 'false' ? false : undefined;
    return this.notificacionesService.findByToRunnerUID(toRunnerUID, leidaBool);
  }

  // Marcar una notificación específica como leída
  @Patch('mark-as-read/:id')
  markAsRead(@Param('id') id: string) {
    return this.notificacionesService.markAsRead(+id);
  }

  // Marcar todas las notificaciones de un usuario como leídas
  @Patch('mark-all-as-read/:toRunnerUID')
  markAllAsRead(@Param('toRunnerUID') toRunnerUID: string) {
    return this.notificacionesService.markAllAsRead(toRunnerUID);
  }

  @Get()
  findAll() {
    return this.notificacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificacioneDto: UpdateNotificacioneDto) {
    return this.notificacionesService.update(+id, updateNotificacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(+id);
  }
}
