import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, Logger } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { CreatePaymentEventoDto } from './dto/create-payment-evento.dto';
import { ConfirmPaymentEventoDto } from './dto/confirm-payment-evento.dto';

@Controller('eventos')
export class EventosController {
  private readonly logger = new Logger(EventosController.name);

  constructor(private readonly eventosService: EventosService) {}

  @Post()
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventosService.create(createEventoDto);
  }

  /**
   * Crea un PaymentIntent de Stripe para pagar la inscripción a un evento
   * Este endpoint debe llamarse PRIMERO, antes de confirmar el pago
   */
  @Post('create-payment-method')
  createPaymentIntent(@Body() createPaymentEventoDto: CreatePaymentEventoDto) {
    this.logger.log(`Creating payment intent for evento: ${JSON.stringify(createPaymentEventoDto)}`);
    return this.eventosService.createPaymentIntent(createPaymentEventoDto);
  }

  /**
   * Confirma el pago de la inscripción a un evento en el backend
   * El frontend debe enviar el paymentMethodId creado con Stripe.js
   * Este endpoint procesa el pago completo
   */
  @Post('confirm-payment-method')
  confirmPaymentEvento(@Body() confirmPaymentEventoDto: ConfirmPaymentEventoDto) {
    this.logger.log(`Confirming payment for evento: ${JSON.stringify(confirmPaymentEventoDto)}`);
    return this.eventosService.confirmPaymentEvento(confirmPaymentEventoDto);
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
