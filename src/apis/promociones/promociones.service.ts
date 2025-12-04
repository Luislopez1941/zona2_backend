import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../common/services/stripe.service';
import { CreatePromocioneDto } from './dto/create-promocione.dto';
import { UpdatePromocioneDto } from './dto/update-promocione.dto';
import { CreatePaymentPromocionDto } from './dto/create-payment-promocion.dto';
import { ConfirmPaymentPromocionDto } from './dto/confirm-payment-promocion.dto';
import { promociones_Estatus } from '@prisma/client';

@Injectable()
export class PromocionesService {
  private readonly logger = new Logger(PromocionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(createPromocioneDto: CreatePromocioneDto) {
    // Convertir fechas de string a Date
    const data = {
      ...createPromocioneDto,
      FechaInicio: new Date(createPromocioneDto.FechaInicio),
      FechaFin: new Date(createPromocioneDto.FechaFin),
      // Convertir imagen de base64 a Buffer si está presente
      Imagen: createPromocioneDto.Imagen
        ? (typeof createPromocioneDto.Imagen === 'string'
            ? Buffer.from(createPromocioneDto.Imagen.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            : createPromocioneDto.Imagen)
        : null,
    };

    const promocion = await this.prisma.promociones.create({
      data,
    });

    return {
      message: 'Promoción creada exitosamente',
      status: 'success',
      promocion,
    };
  }

  /**
   * Devuelve las 10 primeras promociones activas con información del organizador
   */
  async findFirst10() {
    const promociones = await this.prisma.promociones.findMany({
      where: {
        Estatus: promociones_Estatus.Activa,
      },
      take: 10,
      orderBy: {
        FechaInicio: 'desc',
      },
    });

    // Obtener información de los organizadores
    const promocionesConOrganizador = await Promise.all(
      promociones.map(async (promocion) => {
        const organizador = await this.prisma.organizadores.findUnique({
          where: { OrgID: promocion.OrgID },
          select: {
            OrgID: true,
            NombreComercial: true,
            RazonSocial: true,
            ContactoNombre: true,
            ContactoEmail: true,
            ContactoTelefono: true,
            Ciudad: true,
            Estado: true,
            Pais: true,
          },
        });

        return {
          ...promocion,
          organizador,
        };
      }),
    );

    return {
      message: 'Promociones obtenidas exitosamente',
      status: 'success',
      total: promocionesConOrganizador.length,
      promociones: promocionesConOrganizador,
    };
  }

  /**
   * Devuelve todas las promociones con paginación opcional e información del organizador
   */
  async findAll(page?: number, limit?: number) {
    // Función helper para obtener organizador
    const getOrganizador = async (orgID: number) => {
      return await this.prisma.organizadores.findUnique({
        where: { OrgID: orgID },
        select: {
          OrgID: true,
          NombreComercial: true,
          RazonSocial: true,
          ContactoNombre: true,
          ContactoEmail: true,
          ContactoTelefono: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
        },
      });
    };

    // Si no se pasan parámetros, traer todas las promociones
    if (!page && !limit) {
      const promociones = await this.prisma.promociones.findMany({
        orderBy: {
          FechaInicio: 'desc',
        },
      });

      // Obtener información de los organizadores
      const promocionesConOrganizador = await Promise.all(
        promociones.map(async (promocion) => {
          const organizador = await getOrganizador(promocion.OrgID);
          return {
            ...promocion,
            organizador,
          };
        }),
      );

      return {
        message: 'Promociones obtenidas exitosamente',
        status: 'success',
        total: promocionesConOrganizador.length,
        promociones: promocionesConOrganizador,
      };
    }

    // Si se pasan parámetros, usar paginación
    const pageNumber = page || 1;
    const limitNumber = limit || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [promociones, total] = await Promise.all([
      this.prisma.promociones.findMany({
        skip,
        take: limitNumber,
        orderBy: {
          FechaInicio: 'desc',
        },
      }),
      this.prisma.promociones.count(),
    ]);

    // Obtener información de los organizadores
    const promocionesConOrganizador = await Promise.all(
      promociones.map(async (promocion) => {
        const organizador = await getOrganizador(promocion.OrgID);
        return {
          ...promocion,
          organizador,
        };
      }),
    );

    const totalPages = Math.ceil(total / limitNumber);

    return {
      message: 'Promociones obtenidas exitosamente',
      status: 'success',
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      promociones: promocionesConOrganizador,
    };
  }

  async findOne(id: number) {
    const promocion = await this.prisma.promociones.findUnique({
      where: { PromoID: id },
    });

    if (!promocion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
  }

    // Obtener información del organizador
    const organizador = await this.prisma.organizadores.findUnique({
      where: { OrgID: promocion.OrgID },
      select: {
        OrgID: true,
        NombreComercial: true,
        RazonSocial: true,
        ContactoNombre: true,
        ContactoEmail: true,
        ContactoTelefono: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
      },
    });

    return {
      message: 'Promoción obtenida exitosamente',
      status: 'success',
      promocion: {
        ...promocion,
        organizador,
      },
    };
  }

  async update(id: number, updatePromocioneDto: UpdatePromocioneDto) {
    await this.findOne(id); // Verificar que existe

    const promocion = await this.prisma.promociones.update({
      where: { PromoID: id },
      data: updatePromocioneDto,
    });

    return {
      message: 'Promoción actualizada exitosamente',
      status: 'success',
      promocion,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.promociones.delete({
      where: { PromoID: id },
    });

    return {
      message: 'Promoción eliminada exitosamente',
      status: 'success',
    };
  }

  // ========== MÉTODOS DE PAGO CON STRIPE ==========

  /**
   * Crea un PaymentIntent de Stripe para el pago de una promoción
   * Este endpoint solo crea el PaymentIntent, no procesa el pago
   * El frontend debe usar el clientSecret para confirmar el pago
   */
  async createPaymentIntent(createPaymentPromocionDto: CreatePaymentPromocionDto) {
    const { RunnerUID, PromoID, amount, currency = 'mxn' } = createPaymentPromocionDto;

    this.logger.log(`Creating payment intent for promocion - RunnerUID: ${RunnerUID}, PromoID: ${PromoID}, amount: ${amount}, currency: ${currency}`);

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

    // Verificar que la promoción existe
    const promocion = await this.prisma.promociones.findUnique({
      where: { PromoID },
    });

    if (!promocion) {
      this.logger.error(`Promoción no encontrada: ${PromoID}`);
      throw new NotFoundException(`Promoción con ID ${PromoID} no encontrada`);
    }

    try {
      // Crear el PaymentIntent (sin confirmar)
      this.logger.log(`Calling Stripe API - amount: ${amount}, currency: ${normalizedCurrency}`);
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        normalizedCurrency,
        {
          RunnerUID,
          PromoID: PromoID.toString(),
          tipo: 'promocion_compra',
          promocion: promocion.Titulo || `Promoción ${PromoID}`,
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
   * Confirma el pago de una promoción usando el PaymentIntent y PaymentMethod
   * El frontend debe crear el PaymentMethod con Stripe.js y enviar el paymentMethodId
   * Este endpoint procesa el pago completo en el backend
   */
  async confirmPaymentPromocion(confirmPaymentPromocionDto: ConfirmPaymentPromocionDto) {
    const { paymentIntentId, paymentMethodId } = confirmPaymentPromocionDto;

    this.logger.log(`Confirming payment for promocion - paymentIntentId: ${paymentIntentId}, paymentMethodId: ${paymentMethodId}`);

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
        message: 'Canje realizado exitosamente',
        status: 'success',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Payment confirmation error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Canjea una promoción para un usuario (sin pago con Stripe)
   */
  async redeemPromotion(data: { RunnerUID: string; PromoID: number }) {
    const { RunnerUID, PromoID } = data;

    this.logger.log(`Redeeming promotion - RunnerUID: ${RunnerUID}, PromoID: ${PromoID}`);

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      this.logger.error(`Usuario no encontrado: ${RunnerUID}`);
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar que la promoción existe
    const promocion = await this.prisma.promociones.findUnique({
      where: { PromoID },
    });

    if (!promocion) {
      this.logger.error(`Promoción no encontrada: ${PromoID}`);
      throw new NotFoundException(`Promoción con ID ${PromoID} no encontrada`);
    }

    // Verificar que la promoción esté activa
    if (promocion.Estatus !== 'Activa') {
      throw new BadRequestException('La promoción no está activa');
    }

    this.logger.log(`Promotion redeemed successfully - PromoID: ${PromoID}, RunnerUID: ${RunnerUID}`);

    return {
      exito: true,
      message: 'Canje realizado exitosamente',
      status: 'success',
      promocion: {
        PromoID: promocion.PromoID,
        Titulo: promocion.Titulo,
      },
      usuario: {
        RunnerUID: usuario.RunnerUID,
        nombre: usuario.name,
      },
    };
  }
}
