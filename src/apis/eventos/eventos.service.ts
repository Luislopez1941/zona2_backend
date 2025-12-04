import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../common/services/stripe.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { CreatePaymentEventoDto } from './dto/create-payment-evento.dto';
import { ConfirmPaymentEventoDto } from './dto/confirm-payment-evento.dto';

@Injectable()
export class EventosService {
  private readonly logger = new Logger(EventosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  // Función auxiliar para extraer solo la hora de HoraEvento
  private extractHora(horaEvento: Date | string | null): string | null {
    if (!horaEvento) return null;
    
    // Si ya es un string en formato HH:mm:ss, devolverlo directamente
    if (typeof horaEvento === 'string') {
      // Verificar si es formato de hora (HH:mm:ss o HH:mm)
      const horaMatch = horaEvento.match(/^(\d{2}):(\d{2})(:(\d{2}))?$/);
      if (horaMatch) {
        return horaMatch[3] ? horaEvento : `${horaEvento}:00`;
      }
      // Si es un string de fecha/hora, convertir a Date
      const date = new Date(horaEvento);
      if (isNaN(date.getTime())) return null;
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    
    // Si es un objeto Date
    const date = new Date(horaEvento);
    if (isNaN(date.getTime())) return null;
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Función auxiliar para verificar si un usuario está inscrito en un evento
  private async verificarInscripcion(eventoID: number | bigint, runnerUID?: string): Promise<boolean> {
    if (!runnerUID) return false;
    
    // Convertir BigInt a number si es necesario (cuando viene de $queryRaw)
    const eventoIDNumber = typeof eventoID === 'bigint' ? Number(eventoID) : eventoID;
    
    const inscripcion = await this.prisma.inscripciones.findFirst({
      where: {
        EventoID: eventoIDNumber,
        RunnerUID: runnerUID,
      },
    });
    
    return !!inscripcion;
  }

  // Función auxiliar para transformar eventos y extraer solo la hora
  private async transformEventos(eventos: any[], runnerUID?: string): Promise<any[]> {
    // Si hay runnerUID, verificar inscripciones para todos los eventos
    if (runnerUID) {
      const eventosConInscripcion = await Promise.all(
        eventos.map(async (evento) => {
          // Convertir EventoID de BigInt a number si es necesario (cuando viene de $queryRaw)
          const eventoID = typeof evento.EventoID === 'bigint' ? Number(evento.EventoID) : evento.EventoID;
          const inscrito = await this.verificarInscripcion(eventoID, runnerUID);
          return {
            ...evento,
            EventoID: eventoID, // Asegurar que EventoID sea number
            HoraEvento: this.extractHora(evento.HoraEvento),
            inscrito,
          };
        })
      );
      return eventosConInscripcion;
    }
    
    // Si no hay runnerUID, solo transformar la hora y convertir BigInt a number
    return eventos.map((evento) => ({
      ...evento,
      EventoID: typeof evento.EventoID === 'bigint' ? Number(evento.EventoID) : evento.EventoID,
      HoraEvento: this.extractHora(evento.HoraEvento),
      inscrito: false,
    }));
  }

  async create(createEventoDto: CreateEventoDto) {
    // Verificar que el organizador existe
    const organizador = await this.prisma.organizadores.findUnique({
      where: { OrgID: createEventoDto.OrgID },
    });

    if (!organizador) {
      throw new NotFoundException(
        `Organizador con ID ${createEventoDto.OrgID} no encontrado`,
      );
    }

    const evento = await this.prisma.eventos.create({
      data: {
        OrgID: createEventoDto.OrgID,
        Titulo: createEventoDto.Titulo,
        Subtitulo: createEventoDto.Subtitulo,
        TipoEvento: createEventoDto.TipoEvento || 'Carrera',
        Distancias: createEventoDto.Distancias,
        FechaEvento: new Date(createEventoDto.FechaEvento),
        HoraEvento: new Date(`1970-01-01T${createEventoDto.HoraEvento}`),
        Ciudad: createEventoDto.Ciudad,
        Estado: createEventoDto.Estado,
        Lugar: createEventoDto.Lugar,
        UrlMapa: createEventoDto.UrlMapa,
        UrlCalendario: createEventoDto.UrlCalendario,
        UrlImagen: createEventoDto.UrlImagen,
        UrlRegistro: createEventoDto.UrlRegistro,
        UrlPagoDirecto: createEventoDto.UrlPagoDirecto,
        MaxPuntosZ2: createEventoDto.MaxPuntosZ2,
        MaxDescuentoZ2: createEventoDto.MaxDescuentoZ2,
        PuntosEquivalencia: createEventoDto.PuntosEquivalencia,
        DescuentoImporte: createEventoDto.DescuentoImporte,
        UrlCartaExoneracion: createEventoDto.UrlCartaExoneracion,
        GuiaExpectador: createEventoDto.GuiaExpectador,
        PrecioEvento: createEventoDto.PrecioEvento,
        Moneda: createEventoDto.Moneda || 'MXN',
        Estatus: createEventoDto.Estatus || 'borrador',
      },
    });

    const eventoTransformado = {
      ...evento,
      HoraEvento: this.extractHora(evento.HoraEvento),
    };

    return {
      message: 'Evento creado exitosamente',
      status: 'success',
      evento: eventoTransformado,
    };
  }

  async findAll(runnerUID?: string) {
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  async findOne(id: number, runnerUID?: string) {
    const evento = await this.prisma.eventos.findUnique({
      where: { EventoID: id },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    const inscrito = await this.verificarInscripcion(id, runnerUID);
    
    const eventoTransformado = {
      ...evento,
      HoraEvento: this.extractHora(evento.HoraEvento),
      inscrito,
    };

    return {
      message: 'Evento obtenido exitosamente',
      status: 'success',
      evento: eventoTransformado,
    };
  }

  async findByEstado(estado: string, runnerUID?: string) {
    const eventos = await this.prisma.eventos.findMany({
      where: {
        Estado: {
          contains: estado,
        },
      },
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: `Eventos en estado '${estado}' obtenidos exitosamente`,
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  async findByPais(pais: string, runnerUID?: string) {
    // Buscar eventos por país del organizador (ya que eventos no tiene campo Pais directamente)
    const eventos = await this.prisma.$queryRaw`
      SELECT e.* 
      FROM eventos e
      INNER JOIN organizadores o ON e.OrgID = o.OrgID
      WHERE o.Pais LIKE ${`%${pais}%`}
      ORDER BY e.FechaEvento ASC
    `;

    const eventosArray = Array.isArray(eventos) ? eventos : [];
    const eventosTransformados = await this.transformEventos(eventosArray, runnerUID);

    return {
      message: `Eventos en país '${pais}' obtenidos exitosamente`,
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  async findByCiudad(ciudad: string, runnerUID?: string) {
    const eventos = await this.prisma.eventos.findMany({
      where: {
        Ciudad: {
          contains: ciudad,
        },
      },
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: `Eventos en ciudad '${ciudad}' obtenidos exitosamente`,
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    // Verificar que el evento existe
    await this.findOne(id);

    // Si se cambia el organizador, verificar que existe
    if (updateEventoDto.OrgID) {
      const organizador = await this.prisma.organizadores.findUnique({
        where: { OrgID: updateEventoDto.OrgID },
      });

      if (!organizador) {
        throw new NotFoundException(
          `Organizador con ID ${updateEventoDto.OrgID} no encontrado`,
        );
  }
    }

    // Construir objeto de actualización
    const updateData: any = { ...updateEventoDto };

    // Convertir fechas si están presentes
    if (updateEventoDto.FechaEvento) {
      updateData.FechaEvento = new Date(updateEventoDto.FechaEvento);
    }

    if (updateEventoDto.HoraEvento) {
      updateData.HoraEvento = new Date(`1970-01-01T${updateEventoDto.HoraEvento}`);
    }

    // Actualizar FechaActualiza
    updateData.FechaActualiza = new Date();

    const evento = await this.prisma.eventos.update({
      where: { EventoID: id },
      data: updateData,
    });

    const eventoTransformado = {
      ...evento,
      HoraEvento: this.extractHora(evento.HoraEvento),
    };

    return {
      message: 'Evento actualizado exitosamente',
      status: 'success',
      evento: eventoTransformado,
    };
  }

  async remove(id: number) {
    // Verificar que el evento existe
    await this.findOne(id);

    await this.prisma.eventos.delete({
      where: { EventoID: id },
    });

    return {
      message: 'Evento eliminado exitosamente',
      status: 'success',
    };
  }

  // ========== MÉTODOS PARA USUARIOS LOGUEADOS (con bandera inscrito) ==========
  // NOTA: Estos métodos traen TODOS los eventos sin filtrar, solo agregan la bandera inscrito

  /**
   * Obtiene todos los eventos con la bandera inscrito para un usuario específico
   */
  async findAllWithInscrito(runnerUID: string) {
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  /**
   * Obtiene un evento por ID con la bandera inscrito para un usuario específico
   */
  async findOneWithInscrito(id: number, runnerUID: string) {
    const evento = await this.prisma.eventos.findUnique({
      where: { EventoID: id },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    const inscrito = await this.verificarInscripcion(id, runnerUID);
    
    const eventoTransformado = {
      ...evento,
      HoraEvento: this.extractHora(evento.HoraEvento),
      inscrito,
    };

    return {
      message: 'Evento obtenido exitosamente',
      status: 'success',
      evento: eventoTransformado,
    };
  }

  /**
   * Obtiene TODOS los eventos con la bandera inscrito (ignora el parámetro estado)
   * El parámetro estado solo se usa para mantener la misma estructura del endpoint
   */
  async findByEstadoWithInscrito(estado: string, runnerUID: string) {
    // Traer TODOS los eventos sin filtrar por estado
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  /**
   * Obtiene TODOS los eventos con la bandera inscrito (ignora el parámetro pais)
   * El parámetro pais solo se usa para mantener la misma estructura del endpoint
   */
  async findByPaisWithInscrito(pais: string, runnerUID: string) {
    // Traer TODOS los eventos sin filtrar por país
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  /**
   * Obtiene TODOS los eventos con la bandera inscrito (ignora el parámetro ciudad)
   * El parámetro ciudad solo se usa para mantener la misma estructura del endpoint
   */
  async findByCiudadWithInscrito(ciudad: string, runnerUID: string) {
    // Traer TODOS los eventos sin filtrar por ciudad
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    const eventosTransformados = await this.transformEventos(eventos, runnerUID);

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventosTransformados.length,
      eventos: eventosTransformados,
    };
  }

  // ========== MÉTODOS DE PAGO CON STRIPE ==========

  /**
   * Crea un PaymentIntent de Stripe para el pago de un evento
   * Este endpoint solo crea el PaymentIntent, no procesa el pago
   * El frontend debe usar el clientSecret para confirmar el pago
   */
  async createPaymentIntent(createPaymentEventoDto: CreatePaymentEventoDto) {
    const { RunnerUID, EventoID, amount, currency = 'mxn' } = createPaymentEventoDto;

    this.logger.log(`Creating payment intent for evento - RunnerUID: ${RunnerUID}, EventoID: ${EventoID}, amount: ${amount}, currency: ${currency}`);

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

    // Verificar que el evento existe
    const evento = await this.prisma.eventos.findUnique({
      where: { EventoID },
    });

    if (!evento) {
      this.logger.error(`Evento no encontrado: ${EventoID}`);
      throw new NotFoundException(`Evento con ID ${EventoID} no encontrado`);
    }

    try {
      // Crear el PaymentIntent (sin confirmar)
      this.logger.log(`Calling Stripe API - amount: ${amount}, currency: ${normalizedCurrency}`);
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        normalizedCurrency,
        {
          RunnerUID,
          EventoID: EventoID.toString(),
          tipo: 'evento_inscripcion',
          evento: evento.Titulo || `Evento ${EventoID}`,
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
   * Confirma el pago de un evento usando el PaymentIntent y PaymentMethod
   * El frontend debe crear el PaymentMethod con Stripe.js y enviar el paymentMethodId
   * Este endpoint procesa el pago completo en el backend y crea la inscripción
   */
  async confirmPaymentEvento(confirmPaymentEventoDto: ConfirmPaymentEventoDto) {
    const { 
      paymentIntentId, 
      paymentMethodId,
      EventoID,
      RunnerUID,
      DistanciaElegida,
      ...inscripcionData
    } = confirmPaymentEventoDto;

    this.logger.log(`Confirming payment for evento - paymentIntentId: ${paymentIntentId}, paymentMethodId: ${paymentMethodId}, EventoID: ${EventoID}`);

    if (!paymentIntentId || !paymentMethodId) {
      throw new BadRequestException('paymentIntentId y paymentMethodId son requeridos');
    }

    // Verificar que el evento existe
    const evento = await this.prisma.eventos.findUnique({
      where: { EventoID },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${EventoID} no encontrado`);
    }

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar si el usuario ya está inscrito en este evento
    const inscripcionExistente = await this.prisma.inscripciones.findFirst({
      where: {
        EventoID,
        RunnerUID,
      },
    });

    if (inscripcionExistente) {
      throw new BadRequestException('El usuario ya está inscrito en este evento');
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

      // ========== CREAR INSCRIPCIÓN ==========
      this.logger.log(`Creating inscription for EventoID: ${EventoID}, RunnerUID: ${RunnerUID}`);

      // Obtener información del usuario si no se proporciona
      const runnerNombre = inscripcionData.RunnerNombre || usuario.name || null;
      const runnerEmail = inscripcionData.RunnerEmail || usuario.email || null;
      const runnerTelefono = inscripcionData.RunnerTelefono || usuario.phone || null;

      // Calcular precios (el monto viene en centavos de Stripe, convertir a pesos)
      const precioOriginal = evento.PrecioEvento ? Number(evento.PrecioEvento) : paymentIntent.amount / 100;
      const puntosUsados = inscripcionData.PuntosUsados || 0;
      const descuentoAplicado = inscripcionData.DescuentoAplicadoMXN || 0;

      // El precio final es lo que se pagó (convertir de centavos a pesos)
      const precioFinal = paymentIntent.amount / 100;

      // Crear la inscripción
      const inscripcion = await this.prisma.inscripciones.create({
        data: {
          EventoID: evento.EventoID,
          OrgID: evento.OrgID,
          FechaEvento: evento.FechaEvento,
          RunnerUID,
          RunnerNombre: runnerNombre,
          RunnerEmail: runnerEmail,
          RunnerTelefono: runnerTelefono,
          Genero: inscripcionData.Genero || usuario.Genero || null,
          FechaNacimiento: inscripcionData.FechaNacimiento
            ? new Date(inscripcionData.FechaNacimiento)
            : usuario.fechaNacimiento || null,
          TallaPlayera: inscripcionData.TallaPlayera || null,
          EquipoID: inscripcionData.EquipoID || usuario.equipoID || null,
          DistanciaElegida,
          CategoriaElegida: inscripcionData.CategoriaElegida || null,
          Disciplina: inscripcionData.Disciplina || evento.TipoEvento || 'Carrera',
          PrecioOriginal: precioOriginal,
          PuntosUsados: puntosUsados,
          DescuentoAplicadoMXN: descuentoAplicado,
          PrecioFinal: precioFinal,
          Moneda: evento.Moneda || paymentIntent.currency.toUpperCase(),
          MetodoPago: 'Stripe',
          PagoTransaccionID: paymentIntent.id,
          PagoEstado: 'Pagado',
          ContactoEmergencia: inscripcionData.ContactoEmergencia || usuario.EmergenciaContacto || null,
          TelefonoEmergencia: inscripcionData.TelefonoEmergencia || usuario.EmergenciaCelular || null,
          Ciudad: inscripcionData.Ciudad || evento.Ciudad || usuario.Ciudad || null,
          Estado: inscripcionData.Estado || evento.Estado || usuario.Estado || null,
          Pais: inscripcionData.Pais || usuario.Pais || 'México',
          EstatusInscripcion: 'Inscrito',
        },
      });

      this.logger.log(`Inscription created successfully - InscripcionID: ${inscripcion.InscripcionID}`);

      return {
        message: 'Pago confirmado e inscripción creada exitosamente',
        status: 'success',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentStatus: paymentIntent.status,
        inscripcion,
      };
    } catch (error) {
      this.logger.error(`Payment confirmation error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
