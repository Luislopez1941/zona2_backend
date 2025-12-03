import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInscripcioneDto: CreateInscripcioneDto) {
    const { EventoID, RunnerUID } = createInscripcioneDto;

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

    // Obtener información del usuario si no se proporciona
    const runnerNombre = createInscripcioneDto.RunnerNombre || usuario.name || null;
    const runnerEmail = createInscripcioneDto.RunnerEmail || usuario.email || null;
    const runnerTelefono = createInscripcioneDto.RunnerTelefono || usuario.phone || null;

    // Calcular precios
    const precioOriginal = evento.PrecioEvento ? Number(evento.PrecioEvento) : 0;
    const puntosUsados = createInscripcioneDto.PuntosUsados || 0;
    const descuentoAplicado = createInscripcioneDto.DescuentoAplicadoMXN || 0;

    // Calcular precio final
    let precioFinal = precioOriginal - descuentoAplicado;
    if (precioFinal < 0) precioFinal = 0;

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
        Genero: createInscripcioneDto.Genero || null,
        FechaNacimiento: createInscripcioneDto.FechaNacimiento
          ? new Date(createInscripcioneDto.FechaNacimiento)
          : null,
        TallaPlayera: createInscripcioneDto.TallaPlayera || null,
        EquipoID: createInscripcioneDto.EquipoID || null,
        DistanciaElegida: createInscripcioneDto.DistanciaElegida,
        CategoriaElegida: createInscripcioneDto.CategoriaElegida || null,
        Disciplina: createInscripcioneDto.Disciplina || evento.TipoEvento || 'Carrera',
        PrecioOriginal: precioOriginal,
        PuntosUsados: puntosUsados,
        DescuentoAplicadoMXN: descuentoAplicado,
        PrecioFinal: precioFinal,
        Moneda: evento.Moneda || 'MXN',
        MetodoPago: createInscripcioneDto.MetodoPago || null,
        PagoTransaccionID: createInscripcioneDto.PagoTransaccionID || null,
        PagoEstado: 'Pendiente',
        ContactoEmergencia: createInscripcioneDto.ContactoEmergencia || null,
        TelefonoEmergencia: createInscripcioneDto.TelefonoEmergencia || null,
        Ciudad: createInscripcioneDto.Ciudad || evento.Ciudad || null,
        Estado: createInscripcioneDto.Estado || evento.Estado || null,
        Pais: createInscripcioneDto.Pais || evento.Pais || null,
        EstatusInscripcion: 'Inscrito',
      },
    });

    return {
      message: 'Inscripción creada exitosamente',
      status: 'success',
      inscripcion,
    };
  }

  findAll() {
    return `This action returns all inscripciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inscripcione`;
  }

  update(id: number, updateInscripcioneDto: UpdateInscripcioneDto) {
    return `This action updates a #${id} inscripcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} inscripcione`;
  }
}
