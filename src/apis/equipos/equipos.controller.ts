import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { JoinATeamDto } from './dto/join-a-team.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post('create')
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  @Get('by-pais/:pais')
  findByPais(@Param('pais') pais: string) {
    return this.equiposService.findByPais(pais);
  }

  @Get('by-ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.equiposService.findByCiudad(ciudad);
  }

  @Get('by-estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.equiposService.findByEstado(estado);
  }

  @Get('get-all')
  findAll() {
    return this.equiposService.findAll();
  }


  @Get('by-runner/:runnerUID')
  findByRunnerUID(@Param('runnerUID') runnerUID: string) {
    return this.equiposService.findByRunnerUID(runnerUID);
  }

  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.equiposService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equiposService.update(+id, updateEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equiposService.remove(+id);
  }
}
