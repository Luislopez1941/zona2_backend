import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../common/services/stripe.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { JoinATeamDto } from './dto/join-a-team.dto';
import { CreatePaymentEquipoDto } from './dto/create-payment-equipo.dto';
import { ConfirmPaymentEquipoDto } from './dto/confirm-payment-equipo.dto';

@Injectable()
export class EquiposService {
  private readonly logger = new Logger(EquiposService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(createEquipoDto: CreateEquipoDto) {
    const equipo = await this.prisma.equipos.create({
      data: createEquipoDto,
    });

    return {
      message: 'Equipo creado exitosamente',
      status: 'success',
      equipo,
    };
  }

  async findAll() {
    const equipos = await this.prisma.equipos.findMany({
      where: {
        Activo: true,
      },
      orderBy: {
        NombreEquipo: 'asc',
      },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true, // Bytes - se devuelve como Buffer, puede convertirse a base64 si es necesario
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    // Convertir Logo (Buffer) a base64 si existe
    const equiposConLogo = equipos.map((equipo) => ({
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    }));

    return {
      message: 'Equipos obtenidos exitosamente',
      status: 'success',
      total: equiposConLogo.length,
      equipos: equiposConLogo,
    };
  }

  async findOne(id: number) {
    const equipo = await this.prisma.equipos.findUnique({
      where: { OrgID: id },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true,
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    // Convertir Logo (Buffer) a base64 si existe
    const equipoConLogo = {
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    };

    return {
      message: 'Equipo obtenido exitosamente',
      status: 'success',
      equipo: equipoConLogo,
    };
  }

  async update(id: number, updateEquipoDto: UpdateEquipoDto) {
    await this.findOne(id); // Verificar que existe

    const equipo = await this.prisma.equipos.update({
      where: { OrgID: id },
      data: updateEquipoDto,
    });

    return {
      message: 'Equipo actualizado exitosamente',
      status: 'success',
      equipo,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.equipos.update({
      where: { OrgID: id },
      data: { Activo: false },
    });

    return {
      message: 'Equipo desactivado exitosamente',
      status: 'success',
    };
  }

  async joinATeam(joinATeamDto: JoinATeamDto) {
    const { RunnerUID, OrgID } = joinATeamDto;

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar que el equipo existe y está activo
    const equipo = await this.prisma.equipos.findUnique({
      where: { OrgID },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${OrgID} no encontrado`);
  }

    if (!equipo.Activo) {
      throw new ConflictException(`El equipo con ID ${OrgID} no está activo`);
    }

    // Verificar si el usuario ya está en este equipo
      if (usuario.equipoID === OrgID.toString()) {
        return {
          message: 'El usuario ya está en este equipo',
          status: 'success',
        equipo,
        };
    }

    // Actualizar el usuario y los equipos en una transacción
    await this.prisma.$transaction(async (tx) => {
      // Si el usuario estaba en otro equipo, decrementar el contador del equipo anterior
      if (usuario.equipoID) {
        const equipoAnterior = await tx.equipos.findUnique({
          where: { OrgID: parseInt(usuario.equipoID, 10) },
        });

        if (equipoAnterior) {
          await tx.equipos.update({
            where: { OrgID: parseInt(usuario.equipoID, 10) },
            data: {
              AtletasActivos: {
                decrement: 1,
              },
            },
          });
        }
      }

      // Actualizar el equipoID del usuario con el nuevo OrgID (convertir a string)
      await tx.sec_users.update({
        where: { login: usuario.login },
        data: {
          equipoID: OrgID.toString(),
        },
      });

      // Incrementar AtletasActivos del nuevo equipo
        await tx.equipos.update({
          where: { OrgID },
          data: {
            AtletasActivos: {
              increment: 1,
            },
          },
        });
    });

    // Obtener el equipo actualizado
    const equipoActualizado = await this.prisma.equipos.findUnique({
      where: { OrgID },
    });

    return {
      message: 'Usuario unido al equipo exitosamente',
      status: 'success',
      equipo: equipoActualizado,
    };
  }

  /**
   * Obtiene equipos por país
   */
  async findByPais(pais: string) {
    const equipos = await this.prisma.equipos.findMany({
      where: {
        Pais: pais,
        Activo: true,
      },
      orderBy: {
        NombreEquipo: 'asc',
      },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true,
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    // Convertir Logo (Buffer) a base64 si existe
    const equiposConLogo = equipos.map((equipo) => ({
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    }));

    return {
      message: 'Equipos obtenidos exitosamente',
      status: 'success',
      total: equiposConLogo.length,
      pais,
      equipos: equiposConLogo,
    };
  }

  /**
   * Obtiene equipos por ciudad
   */
  async findByCiudad(ciudad: string) {
    const equipos = await this.prisma.equipos.findMany({
      where: {
        Ciudad: ciudad,
        Activo: true,
      },
      orderBy: {
        NombreEquipo: 'asc',
      },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true,
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    // Convertir Logo (Buffer) a base64 si existe
    const equiposConLogo = equipos.map((equipo) => ({
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    }));

    return {
      message: 'Equipos obtenidos exitosamente',
      status: 'success',
      total: equiposConLogo.length,
      ciudad,
      equipos: equiposConLogo,
    };
  }

  /**
   * Obtiene equipos por estado
   */
  async findByEstado(estado: string) {
    const equipos = await this.prisma.equipos.findMany({
      where: {
        Estado: estado,
        Activo: true,
      },
      orderBy: {
        NombreEquipo: 'asc',
      },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true,
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    // Convertir Logo (Buffer) a base64 si existe
    const equiposConLogo = equipos.map((equipo) => ({
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    }));

    return {
      message: 'Equipos obtenidos exitosamente',
      status: 'success',
      total: equiposConLogo.length,
      estado,
      equipos: equiposConLogo,
    };
  }

  /**
   * Obtiene equipos por RunnerUID del dueño
   */
  async findByRunnerUID(runnerUID: string) {
    const equipos = await this.prisma.equipos.findMany({
      where: {
        RunnerUID: runnerUID,
        Activo: true,
      },
      orderBy: {
        NombreEquipo: 'asc',
      },
      // Devolver todos los campos de la tabla
      select: {
        OrgID: true,
        RunnerUID: true,
        Logo: true,
        Contacto: true,
        Celular: true,
        Correo: true,
        NombreEquipo: true,
        AliasEquipo: true,
        RFC: true,
        Descripcion: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        LugarEntrenamiento: true,
        Disciplinas: true,
        HorarioEntrenamiento: true,
        AtletasActivos: true,
        EntrenadoresTotales: true,
        ProgramasDisponibles: true,
        EntrenadoresEspecialidad: true,
        NivelEquipo: true,
        Certificacion: true,
        IntegracionZona2: true,
        CostoMensual: true,
        ContactoWhatsApp: true,
        RedSocial: true,
        Activo: true,
      },
    });

    // Convertir Logo (Buffer) a base64 si existe
    const equiposConLogo = equipos.map((equipo) => ({
      ...equipo,
      Logo: equipo.Logo ? `data:image/png;base64,${Buffer.from(equipo.Logo).toString('base64')}` : null,
    }));

    return {
      message: 'Equipos obtenidos exitosamente',
      status: 'success',
      total: equiposConLogo.length,
      runnerUID,
      equipos: equiposConLogo,
    };
  }

  // ========== MÉTODOS DE PAGO CON STRIPE ==========

  /**
   * Crea un PaymentIntent de Stripe para el pago de membresía de un equipo
   * Este endpoint solo crea el PaymentIntent, no procesa el pago
   * El frontend debe usar el clientSecret para confirmar el pago
   */
  async createPaymentIntent(createPaymentEquipoDto: CreatePaymentEquipoDto) {
    const { RunnerUID, OrgID, amount, currency = 'mxn' } = createPaymentEquipoDto;

    this.logger.log(`Creating payment intent for equipo - RunnerUID: ${RunnerUID}, OrgID: ${OrgID}, amount: ${amount}, currency: ${currency}`);

    // Validar amount
    if (!amount || amount <= 0) {
      this.logger.error(`Invalid amount: ${amount}`);
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Normalizar currency a minúsculas
    const normalizedCurrency = currency.toLowerCase();

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      this.logger.error(`Usuario no encontrado: ${RunnerUID}`);
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar que el equipo existe
    const equipo = await this.prisma.equipos.findUnique({
      where: { OrgID },
    });

    if (!equipo) {
      this.logger.error(`Equipo no encontrado: ${OrgID}`);
      throw new NotFoundException(`Equipo con ID ${OrgID} no encontrado`);
    }

    try {
      // Crear el PaymentIntent (sin confirmar)
      this.logger.log(`Calling Stripe API - amount: ${amount}, currency: ${normalizedCurrency}`);
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        normalizedCurrency,
        {
          RunnerUID,
          OrgID: OrgID.toString(),
          tipo: 'equipo_membresia',
          equipo: equipo.NombreEquipo || `Equipo ${OrgID}`,
          usuario: usuario.name || RunnerUID,
        },
      );

      this.logger.log(`PaymentIntent created successfully - ID: ${paymentIntent.id}`);

      return {
        message: 'PaymentIntent creado exitosamente',
        status: 'success',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      this.logger.error(`Payment error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirma el pago de membresía de un equipo usando el PaymentIntent y PaymentMethod
   * El frontend debe crear el PaymentMethod con Stripe.js y enviar el paymentMethodId
   * Este endpoint procesa el pago completo en el backend
   */
  async confirmPaymentEquipo(confirmPaymentEquipoDto: ConfirmPaymentEquipoDto) {
    const { paymentIntentId, paymentMethodId } = confirmPaymentEquipoDto;

    this.logger.log(`Confirming payment for equipo - paymentIntentId: ${paymentIntentId}, paymentMethodId: ${paymentMethodId}`);

    if (!paymentIntentId || !paymentMethodId) {
      throw new BadRequestException('paymentIntentId y paymentMethodId son requeridos');
    }

    try {
      // Confirmar el PaymentIntent con el PaymentMethod
      this.logger.log(`Confirming PaymentIntent with Stripe API`);
      const paymentIntent = await this.stripeService.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId,
      );

      this.logger.log(`Payment confirmed - ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);

      // Verificar que el pago fue exitoso
      if (paymentIntent.status !== 'succeeded') {
        this.logger.warn(`Payment not succeeded - status: ${paymentIntent.status}`);
        throw new BadRequestException(
          `El pago no se completó exitosamente. Estado: ${paymentIntent.status}`,
        );
      }

      return {
        exito: true,
        message: 'Pago de membresía confirmado exitosamente',
        status: 'success',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Payment confirmation error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
