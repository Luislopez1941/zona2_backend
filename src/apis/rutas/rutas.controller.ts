import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Post('create')
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Get('get-all')
  findAll() {
    return this.rutasService.findAll();
  }

  @Get('get-by-pais/:pais')
  findByPais(@Param('pais') pais: string) {
    return this.rutasService.findByPais(pais);
  }

  @Get('get-by-ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.rutasService.findByCiudad(ciudad);
  }

  @Get('get-by-estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.rutasService.findByEstado(estado);
  }

  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.rutasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutaDto: UpdateRutaDto) {
    return this.rutasService.update(+id, updateRutaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutasService.remove(+id);
  }
}
