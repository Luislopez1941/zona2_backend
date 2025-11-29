import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ZonasService } from './zonas.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Post('create')
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonasService.create(createZonaDto);
  }

  // Obtener todas las zonas de un usuario (las que recibió)
  @Get('get-by-runneruid/:runnerUID')
  findAll(@Param('runnerUID') runnerUID: string, @Query('currentUser') currentUser?: string) {
    return this.zonasService.findByRunnerUID(runnerUID, currentUser);
  }
}
