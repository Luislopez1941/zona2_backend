import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { JoinATeamDto } from './dto/join-a-team.dto';
import { CreatePaymentEquipoDto } from './dto/create-payment-equipo.dto';
import { ConfirmPaymentEquipoDto } from './dto/confirm-payment-equipo.dto';

@Controller('equipos')
export class EquiposController {
  private readonly logger = new Logger(EquiposController.name);

  constructor(private readonly equiposService: EquiposService) {}

  @Post('create')
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  /**
   * Crea un PaymentIntent de Stripe para pagar la membresía de un equipo
   * Este endpoint debe llamarse PRIMERO, antes de confirmar el pago
   */
  @Post('create-payment-equipo')
  createPaymentIntent(@Body() createPaymentEquipoDto: CreatePaymentEquipoDto) {
    this.logger.log(`Creating payment intent for equipo: ${JSON.stringify(createPaymentEquipoDto)}`);
    return this.equiposService.createPaymentIntent(createPaymentEquipoDto);
  }

  /**
   * Confirma el pago de membresía de un equipo en el backend
   * El frontend debe enviar el paymentMethodId creado con Stripe.js
   * Este endpoint procesa el pago completo
   */
  @Post('confirm-payment-equipo')
  confirmPaymentEquipo(@Body() confirmPaymentEquipoDto: ConfirmPaymentEquipoDto) {
    this.logger.log(`Confirming payment for equipo: ${JSON.stringify(confirmPaymentEquipoDto)}`);
    return this.equiposService.confirmPaymentEquipo(confirmPaymentEquipoDto);
  }

  @Get('by-pais/:pais')
  findByPais(@Param('pais') pais: string) {
    return this.equiposService.findByPais(pais);
  }

  @Get('by-ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.equiposService.findByCiudad(ciudad);
  }

  @Get('by-estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.equiposService.findByEstado(estado);
  }

  @Get('get-all')
  findAll() {
    return this.equiposService.findAll();
  }


  @Get('by-runner/:runnerUID')
  findByRunnerUID(@Param('runnerUID') runnerUID: string) {
    return this.equiposService.findByRunnerUID(runnerUID);
  }

  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.equiposService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equiposService.update(+id, updateEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equiposService.remove(+id);
  }
}
