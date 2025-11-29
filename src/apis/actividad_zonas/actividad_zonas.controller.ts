import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadZonasService } from './actividad_zonas.service';
import { CreateActividadZonaDto } from './dto/create-actividad_zona.dto';
import { UpdateActividadZonaDto } from './dto/update-actividad_zona.dto';

@Controller('actividad-zonas')
export class ActividadZonasController {
  constructor(private readonly actividadZonasService: ActividadZonasService) {}

  // Crear una zona de actividad (zonas de frecuencia cardíaca, etc.)
  @Post('create')
  create(@Body() createActividadZonaDto: CreateActividadZonaDto) {
    return this.actividadZonasService.create(createActividadZonaDto);
  }

  @Get()
  findAll() {
    return this.actividadZonasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadZonasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadZonaDto: UpdateActividadZonaDto) {
    return this.actividadZonasService.update(+id, updateActividadZonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadZonasService.remove(+id);
  }
}
