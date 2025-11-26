import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventosService.create(createEventoDto);
  }

  @Get('get-all')
  findAll() {
    return this.eventosService.findAll();
  }

  @Get('get-by-id/:id')
  findById(@Param('id') id: string) {
    return this.eventosService.findOne(+id);
  }

  @Get('get-by-estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.eventosService.findByEstado(estado);
  }

  @Get('get-by-pais/:pais')
  findByPais(@Param('pais') pais: string) {
    return this.eventosService.findByPais(pais);
  }

  @Get('get-by-ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.eventosService.findByCiudad(ciudad);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(+id, updateEventoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventosService.remove(+id);
  }
}
