import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, Logger } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { CreatePromocioneDto } from './dto/create-promocione.dto';
import { UpdatePromocioneDto } from './dto/update-promocione.dto';
import { CreatePaymentPromocionDto } from './dto/create-payment-promocion.dto';
import { ConfirmPaymentPromocionDto } from './dto/confirm-payment-promocion.dto';

@Controller('promociones')
export class PromocionesController {
  private readonly logger = new Logger(PromocionesController.name);

  constructor(private readonly promocionesService: PromocionesService) {}

  @Post()
  create(@Body() createPromocioneDto: CreatePromocioneDto) {
    return this.promocionesService.create(createPromocioneDto);
  }

  /**
   * Crea un PaymentIntent de Stripe para pagar una promoción
   * Este endpoint debe llamarse PRIMERO, antes de confirmar el pago
   */
  @Post('create-payment-promocion')
  createPaymentIntent(@Body() createPaymentPromocionDto: CreatePaymentPromocionDto) {
    this.logger.log(`Creating payment intent for promocion: ${JSON.stringify(createPaymentPromocionDto)}`);
    return this.promocionesService.createPaymentIntent(createPaymentPromocionDto);
  }

  /**
   * Confirma el pago de una promoción en el backend
   * El frontend debe enviar el paymentMethodId creado con Stripe.js
   * Este endpoint procesa el pago completo
   */
  @Post('confirm-payment-promocion')
  confirmPaymentPromocion(@Body() confirmPaymentPromocionDto: ConfirmPaymentPromocionDto) {
    this.logger.log(`Confirming payment for promocion: ${JSON.stringify(confirmPaymentPromocionDto)}`);
    return this.promocionesService.confirmPaymentPromocion(confirmPaymentPromocionDto);
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

  @Get('get-by-id/:id')
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

  /**
   * Canjea una promoción para un usuario
   */
  @Post('redeem')
  redeemPromotion(@Body() data: { RunnerUID: string; PromoID: number }) {
    this.logger.log(`Redeeming promotion: ${JSON.stringify(data)}`);
    return this.promocionesService.redeemPromotion(data);
  }
}
