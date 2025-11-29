import { Controller, Get } from '@nestjs/common';
import { EstadosMexicoService } from './estados_mexico.service';

@Controller('estados-mexico')
export class EstadosMexicoController {
  constructor(private readonly estadosMexicoService: EstadosMexicoService) {}

  @Get('get-all')
  findAll() {
    return this.estadosMexicoService.findAll();
  }
}
