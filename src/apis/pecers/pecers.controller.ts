import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, Logger } from '@nestjs/common';
import { PecersService } from './pecers.service';
import { CreatePecerDto } from './dto/create-pecer.dto';
import { UpdatePecerDto } from './dto/update-pecer.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentPacerDto } from './dto/confirm-payment-pacer.dto';

@Controller('pacers')
export class PecersController {
  private readonly logger = new Logger(PecersController.name);

  constructor(private readonly pecersService: PecersService) {}

  /**
   * Crea un PaymentIntent de Stripe para pagar la membresía de pacer
   * Este endpoint debe llamarse PRIMERO, antes de confirmar el pago
   */
  @Post('create-payment-pacer')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    this.logger.log(`Creating payment intent for pacer: ${JSON.stringify(createPaymentIntentDto)}`);
    return this.pecersService.createPaymentIntent(createPaymentIntentDto);
  }

  /**
   * Confirma el pago de la membresía de pacer en el backend
   * El frontend debe enviar el paymentMethodId creado con Stripe.js
   * Este endpoint procesa el pago completo
   */
  @Post('confirm-payment-pacer')
  confirmPaymentPacer(@Body() confirmPaymentPacerDto: ConfirmPaymentPacerDto) {
    this.logger.log(`Confirming payment for pacer: ${JSON.stringify(confirmPaymentPacerDto)}`);
    return this.pecersService.confirmPaymentPacer(confirmPaymentPacerDto);
  }

  /**
   * Crea un pacer después de verificar que el pago fue exitoso
   * Requiere el paymentIntentId en el body para verificar el pago
   */
  @Post('create')
  create(@Body() createPecerDto: CreatePecerDto) {
    return this.pecersService.create(createPecerDto);
  }

  @Get('get-all')
  findAll() {
    return this.pecersService.findAll();
  }

  @Get('search-pacers')
  searchPacers(
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Validar que el query tenga al menos 2 caracteres
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'El parámetro query debe tener al menos 2 caracteres',
      );
    }

    // Validar y parsear paginación
    let pageNumber = 1;
    let limitNumber = 20; // Por defecto 20 resultados

    if (page) {
      pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new BadRequestException(
          'El parámetro page debe ser un número mayor a 0',
        );
      }
    }

    if (limit) {
      limitNumber = parseInt(limit, 10);
      if (isNaN(limitNumber) || limitNumber < 1) {
        throw new BadRequestException(
          'El parámetro limit debe ser un número mayor a 0',
        );
      }
      // Limitar el máximo de resultados por página para evitar sobrecarga
      const maxLimit = 50;
      limitNumber = limitNumber > maxLimit ? maxLimit : limitNumber;
    }

    return this.pecersService.searchPacers(
      query.trim(),
      pageNumber,
      limitNumber,
    );
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pecersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePecerDto: UpdatePecerDto) {
    return this.pecersService.update(+id, updatePecerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pecersService.remove(+id);
  }
}
