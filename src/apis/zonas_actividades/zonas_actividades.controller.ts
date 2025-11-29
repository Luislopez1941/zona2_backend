import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZonasActividadesService } from './zonas_actividades.service';
import { CreateZonasActividadeDto } from './dto/create-zonas_actividade.dto';
import { UpdateZonasActividadeDto } from './dto/update-zonas_actividade.dto';

@Controller('zonas-actividades')
export class ZonasActividadesController {
  constructor(private readonly zonasActividadesService: ZonasActividadesService) {}

  // Dar zonas a una actividad (también crea registro en tabla zonas para el usuario que recibe)
  @Post('create')
  create(@Body() createZonasActividadeDto: CreateZonasActividadeDto) {
    return this.zonasActividadesService.create(createZonasActividadeDto);
  }

  // Verificar si un usuario ya dio zonas a una actividad
  @Get('has-given/:runnerUIDRef/:actID')
  hasGivenZonas(
    @Param('runnerUIDRef') runnerUIDRef: string,
    @Param('actID') actID: string,
  ) {
    return this.zonasActividadesService.hasGivenZonas(runnerUIDRef, +actID);
  }

  // Obtener todas las zonas que un usuario ha dado
  @Get('given-by-user/:runnerUIDRef')
  getZonasGivenByUser(@Param('runnerUIDRef') runnerUIDRef: string) {
    return this.zonasActividadesService.getZonasGivenByUser(runnerUIDRef);
  }

  // Obtener todas las zonas recibidas por una actividad
  @Get('by-activity/:actID')
  getZonasByActivity(@Param('actID') actID: string) {
    return this.zonasActividadesService.getZonasByActivity(+actID);
  }

  @Get()
  findAll() {
    return this.zonasActividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonasActividadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonasActividadeDto: UpdateZonasActividadeDto) {
    return this.zonasActividadesService.update(+id, updateZonasActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonasActividadesService.remove(+id);
  }
}
