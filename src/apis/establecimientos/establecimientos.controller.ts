import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { CreateEstablecimientoDto } from './dto/create-establecimiento.dto';
import { UpdateEstablecimientoDto } from './dto/update-establecimiento.dto';

@Controller('establecimientos')
export class EstablecimientosController {
  constructor(private readonly establecimientosService: EstablecimientosService) {}

  @Post()
  create(@Body() createEstablecimientoDto: CreateEstablecimientoDto) {
    return this.establecimientosService.create(createEstablecimientoDto);
  }

  @Get()
  findAll() {
    return this.establecimientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.establecimientosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstablecimientoDto: UpdateEstablecimientoDto) {
    return this.establecimientosService.update(+id, updateEstablecimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.establecimientosService.remove(+id);
  }
}
