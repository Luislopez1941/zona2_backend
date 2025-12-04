import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
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
  findAll(@Query('runnerUID') runnerUID?: string) {
    return this.eventosService.findAll(runnerUID);
  }

  @Get('get-by-id/:id')
  findById(@Param('id') id: string, @Query('runnerUID') runnerUID?: string) {
    return this.eventosService.findOne(+id, runnerUID);
  }

  @Get('get-by-estado/:estado')
  findByEstado(@Param('estado') estado: string, @Query('runnerUID') runnerUID?: string) {
    return this.eventosService.findByEstado(estado, runnerUID);
  }

  @Get('get-by-pais/:pais')
  findByPais(@Param('pais') pais: string, @Query('runnerUID') runnerUID?: string) {
    return this.eventosService.findByPais(pais, runnerUID);
  }

  @Get('get-by-ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string, @Query('runnerUID') runnerUID?: string) {
    return this.eventosService.findByCiudad(ciudad, runnerUID);
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
