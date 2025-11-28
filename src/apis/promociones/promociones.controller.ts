import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { CreatePromocioneDto } from './dto/create-promocione.dto';
import { UpdatePromocioneDto } from './dto/update-promocione.dto';

@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Post()
  create(@Body() createPromocioneDto: CreatePromocioneDto) {
    return this.promocionesService.create(createPromocioneDto);
  }

  @Get('get-all')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Si no se pasan parámetros, traer todas las promociones
    if (!page && !limit) {
      return this.promocionesService.findAll();
    }

    // Si se pasan parámetros, validar y usar paginación
    let pageNumber: number | undefined;
    let limitNumber: number | undefined;

    if (page) {
      pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new BadRequestException('El parámetro page debe ser un número mayor a 0');
      }
    }

    if (limit) {
      limitNumber = parseInt(limit, 10);
      if (isNaN(limitNumber) || limitNumber < 1) {
        throw new BadRequestException('El parámetro limit debe ser un número mayor a 0');
      }
      // Limitar el máximo de resultados por página
      const maxLimit = 100;
      limitNumber = limitNumber > maxLimit ? maxLimit : limitNumber;
    }

    return this.promocionesService.findAll(pageNumber, limitNumber);
  }

  @Get()
  findFirst10() {
    return this.promocionesService.findFirst10();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Validar que el ID sea numérico antes de parsear
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('El ID debe ser un número válido');
    }
    
    const promoId = parseInt(id, 10);
    if (isNaN(promoId) || promoId < 1) {
      throw new BadRequestException('El ID debe ser un número válido mayor a 0');
    }
    return this.promocionesService.findOne(promoId);
  }
}
