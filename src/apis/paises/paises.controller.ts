import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaisesService } from './paises.service';
import { CreatePaiseDto } from './dto/create-paise.dto';

@Controller('paises')
export class PaisesController {
  constructor(private readonly paisesService: PaisesService) {}

  @Post('create')
  create(@Body() createPaiseDto: CreatePaiseDto) {
    return this.paisesService.create(createPaiseDto);
  }

  @Get('get-all')
  findAll() {
    return this.paisesService.findAll();
  }
}
