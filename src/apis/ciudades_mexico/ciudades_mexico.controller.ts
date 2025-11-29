import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CiudadesMexicoService } from './ciudades_mexico.service';
import { CreateCiudadesMexicoDto } from './dto/create-ciudades_mexico.dto';
import { UpdateCiudadesMexicoDto } from './dto/update-ciudades_mexico.dto';

@Controller('ciudades-mexico')
export class CiudadesMexicoController {
  constructor(private readonly ciudadesMexicoService: CiudadesMexicoService) {}
  
  @Get('get-all')
  findAll(@Query('estado') estado?: string) {
    return this.ciudadesMexicoService.findAll(estado);
  }

}
