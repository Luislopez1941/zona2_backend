import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../common/services/stripe.service';
import { CreatePecerDto } from './dto/create-pecer.dto';
import { UpdatePecerDto } from './dto/update-pecer.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentPacerDto } from './dto/confirm-payment-pacer.dto';

@Injectable()
export class PecersService {
  private readonly logger = new Logger(PecersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Crea un PaymentIntent de Stripe para el pago de la membresía de pacer
   * Este endpoint solo crea el PaymentIntent, no procesa el pago
   * El frontend debe usar el clientSecret para confirmar el pago
   */
  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const { RunnerUID, amount, currency = 'mxn' } = createPaymentIntentDto;

    this.logger.log(`Creating payment intent - RunnerUID: ${RunnerUID}, amount: ${amount}, currency: ${currency}`);

    // Validar amount
    if (!amount || amount <= 0) {
      this.logger.error(`Invalid amount: ${amount}`);
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Normalizar currency a minúsculas (Stripe requiere 'mxn' no 'MXN')
    const normalizedCurrency = currency.toLowerCase();

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      this.logger.error(`Usuario no encontrado: ${RunnerUID}`);
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar si el usuario ya es un pacer
    const pacerExistente = await this.prisma.pacers.findFirst({
      where: { RunnerUID },
    });

    if (pacerExistente) {
      this.logger.warn(`Usuario ya es pacer: ${RunnerUID}`);
      throw new ConflictException(`El usuario con RunnerUID ${RunnerUID} ya es un pacer`);
    }

    try {
      // Crear el PaymentIntent (sin confirmar)
      this.logger.log(`Calling Stripe API - amount: ${amount}, currency: ${normalizedCurrency}`);
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        normalizedCurrency,
        {
          RunnerUID,
          tipo: 'pacer_membresia',
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
   * Confirma el pago de la membresía de pacer usando el PaymentIntent y PaymentMethod
   * El frontend debe crear el PaymentMethod con Stripe.js y enviar el paymentMethodId
   * Este endpoint procesa el pago completo en el backend
   */
  async confirmPaymentPacer(confirmPaymentPacerDto: ConfirmPaymentPacerDto) {
    const { paymentIntentId, paymentMethodId } = confirmPaymentPacerDto;

    this.logger.log(`Confirming payment - paymentIntentId: ${paymentIntentId}, paymentMethodId: ${paymentMethodId}`);

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
        message: 'Pago confirmado exitosamente',
        status: 'success',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentStatus: paymentIntent.status,
      };
    } catch (error) {
      this.logger.error(`Payment confirmation error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crea un pacer después de verificar que el pago fue exitoso
   * @param createPecerDto Datos del pacer (incluye paymentIntentId opcional)
   */
  async create(createPecerDto: CreatePecerDto) {
    const { RunnerUID, paymentIntentId, ...rest } = createPecerDto;

    // 0. Si se proporciona paymentIntentId, verificar que el pago fue exitoso
    if (paymentIntentId) {
      this.logger.log(`Verifying payment for paymentIntentId: ${paymentIntentId}`);
      try {
      const paymentVerified = await this.stripeService.verifyPayment(paymentIntentId);
      if (!paymentVerified) {
          this.logger.warn(`Payment not verified for paymentIntentId: ${paymentIntentId}`);
        throw new BadRequestException(
          'El pago no ha sido completado exitosamente. Por favor, completa el pago antes de crear el pacer.',
        );
        }
        this.logger.log(`Payment verified successfully for paymentIntentId: ${paymentIntentId}`);
      } catch (error) {
        this.logger.error(`Error verifying payment: ${error.message}`, error.stack);
        throw error;
      }
    }

    // 1. Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // 2. Verificar si el usuario ya es un pacer
    const pacerExistente = await this.prisma.pacers.findFirst({
      where: { RunnerUID },
    });

    if (pacerExistente) {
      throw new ConflictException(`El usuario con RunnerUID ${RunnerUID} ya es un pacer`);
    }

    // 3. Actualizar TipoMembresia a 'P' en sec_users
    await this.prisma.sec_users.update({
      where: { login: usuario.login },
      data: { TipoMembresia: 'P' },
    });

    // 4. Obtener datos del usuario para completar la información del pacer
    const NombreCompleto = usuario.name || 'Sin nombre';
    const CiudadBase = rest.CiudadBase || usuario.Ciudad || null;
    const EstadoBase = rest.EstadoBase || usuario.Estado || null;
    const PaisBase = rest.PaisBase || usuario.Pais || 'México';

    // 5. Crear el pacer
    const pacer = await this.prisma.pacers.create({
      data: {
        RunnerUID,
        NombreCompleto,
        AliasPacer: rest.AliasPacer || null,
        Biografia: rest.Biografia || null,
        Idiomas: rest.Idiomas || null,
        RitmoMin: rest.RitmoMin || null,
        DistanciasDominadas: rest.DistanciasDominadas || null,
        Certificaciones: rest.Certificaciones || null,
        CiudadBase,
        EstadoBase,
        PaisBase,
        DisponibilidadHoraria: rest.DisponibilidadHoraria || null,
        PickUpHotel: rest.PickUpHotel || false,
        FotoPerfilURL: rest.FotoPerfilURL || null,
        RedesSociales: rest.RedesSociales || null,
        Tarifabase: rest.Tarifabase || null,
        CalificacionPromedio: 0.00,
        TotalReviews: 0,
        TotalExperienciasRealizadas: 0,
        PacerActivo: true,
      },
    });

    return {
      message: 'Pacer creado exitosamente',
      status: 'success',
      pacer,
    };
  }

  async findAll() {
    const pacers = await this.prisma.pacers.findMany({
      where: {
        PacerActivo: true,
      },
      orderBy: {
        NombreCompleto: 'asc',
      },
    });

    return {
      message: 'Pacers obtenidos exitosamente',
      status: 'success',
      total: pacers.length,
      pacers,
    };
  }

  /**
   * Busca pacers por NombreCompleto o AliasPacer
   * Solo devuelve pacers activos
   */
  async searchPacers(query: string, page: number = 1, limit: number = 20) {
    // Validar query
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'El término de búsqueda debe tener al menos 2 caracteres',
      );
    }

    // Limitar el máximo de resultados por página
    const maxLimit = 50;
    const limitNumber = limit > maxLimit ? maxLimit : limit;

    // Calcular offset para paginación
    const skip = (page - 1) * limitNumber;

    // Normalizar el query para búsqueda
    const searchTerm = query.trim();

    // OPTIMIZACIÓN: Usar búsqueda eficiente con LIKE
    // Buscar en la tabla pacers por NombreCompleto o AliasPacer
    const [pacers, total] = await Promise.all([
      // Búsqueda principal: pacers cuyo nombre o alias empieza con el término (más relevante)
      this.prisma.pacers.findMany({
        where: {
          AND: [
            {
              PacerActivo: true,
            },
            {
              OR: [
                {
                  NombreCompleto: {
                    startsWith: searchTerm,
                  },
                },
                {
                  AliasPacer: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          ],
        },
        orderBy: [
          {
            NombreCompleto: 'asc',
          },
        ],
        skip,
        take: limitNumber,
      }),
      // Contar total de resultados
      this.prisma.pacers.count({
        where: {
          AND: [
            {
              PacerActivo: true,
            },
            {
              OR: [
                {
                  NombreCompleto: {
                    startsWith: searchTerm,
                  },
                },
                {
                  AliasPacer: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          ],
        },
      }),
    ]);

    // Si no hay resultados con "starts with", buscar con "contains"
    let resultadosFinales = pacers;
    let totalFinal = total;

    if (pacers.length === 0) {
      const [pacersContains, totalContains] = await Promise.all([
        this.prisma.pacers.findMany({
          where: {
            AND: [
              {
                PacerActivo: true,
              },
              {
                OR: [
                  {
                    NombreCompleto: {
                      contains: searchTerm,
                    },
                  },
                  {
                    AliasPacer: {
                      contains: searchTerm,
                    },
                  },
                ],
              },
            ],
          },
          orderBy: [
            {
              NombreCompleto: 'asc',
            },
          ],
          skip,
          take: limitNumber,
        }),
        this.prisma.pacers.count({
          where: {
            AND: [
              {
                PacerActivo: true,
              },
              {
                OR: [
                  {
                    NombreCompleto: {
                      contains: searchTerm,
                    },
                  },
                  {
                    AliasPacer: {
                      contains: searchTerm,
                    },
                  },
                ],
              },
            ],
          },
        }),
      ]);

      resultadosFinales = pacersContains;
      totalFinal = totalContains;
    }

    // Calcular total de páginas
    const totalPages = Math.ceil(totalFinal / limitNumber);

    return {
      message: 'Pacers encontrados exitosamente',
      status: 'success',
      query: searchTerm,
      pagination: {
        page: page,
        limit: limitNumber,
        total: totalFinal,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      pacers: resultadosFinales,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} pecer`;
  }

  update(id: number, updatePecerDto: UpdatePecerDto) {
    return `This action updates a #${id} pecer`;
  }

  remove(id: number) {
    return `This action removes a #${id} pecer`;
  }
}
