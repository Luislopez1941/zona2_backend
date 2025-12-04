import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

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
}
