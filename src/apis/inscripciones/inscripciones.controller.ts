import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post('create')
  create(@Body() createInscripcioneDto: CreateInscripcioneDto) {
    return this.inscripcionesService.create(createInscripcioneDto);
  }

  @Get('get-by-runner/:runnerUID')
  findByRunnerUID(@Param('runnerUID') runnerUID: string) {
    return this.inscripcionesService.findByRunnerUID(runnerUID);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInscripcioneDto: UpdateInscripcioneDto) {
    return this.inscripcionesService.update(+id, updateInscripcioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.remove(+id);
  }
}
