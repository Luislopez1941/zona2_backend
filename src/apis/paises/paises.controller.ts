import { Controller, Get } from '@nestjs/common';
import { PaisesService } from './paises.service';

@Controller('paises')
export class PaisesController {
  constructor(private readonly paisesService: PaisesService) {}

  @Get('get-all')
  findAll() {
    return this.paisesService.findAll();
  }
}
