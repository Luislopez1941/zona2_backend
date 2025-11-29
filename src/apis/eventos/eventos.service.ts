import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      message: 'Evento creado exitosamente',
      status: 'success',
      evento,
    };
  }

  async findAll() {
    const eventos = await this.prisma.eventos.findMany({
      orderBy: {
        FechaEvento: 'asc',
      },
    });

    return {
      message: 'Eventos obtenidos exitosamente',
      status: 'success',
      total: eventos.length,
      eventos,
    };
  }

  async findOne(id: number) {
    const evento = await this.prisma.eventos.findUnique({
      where: { EventoID: id },
    });

    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return {
      message: 'Evento obtenido exitosamente',
      status: 'success',
      evento,
    };
  }

  async findByEstado(estado: string) {
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

    return {
      message: `Eventos en estado '${estado}' obtenidos exitosamente`,
      status: 'success',
      total: eventos.length,
      eventos,
    };
  }

  async findByPais(pais: string) {
    // Buscar eventos por país del organizador (ya que eventos no tiene campo Pais directamente)
    const eventos = await this.prisma.$queryRaw`
      SELECT e.* 
      FROM eventos e
      INNER JOIN organizadores o ON e.OrgID = o.OrgID
      WHERE o.Pais LIKE ${`%${pais}%`}
      ORDER BY e.FechaEvento ASC
    `;

    return {
      message: `Eventos en país '${pais}' obtenidos exitosamente`,
      status: 'success',
      total: Array.isArray(eventos) ? eventos.length : 0,
      eventos,
    };
  }

  async findByCiudad(ciudad: string) {
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

    return {
      message: `Eventos en ciudad '${ciudad}' obtenidos exitosamente`,
      status: 'success',
      total: eventos.length,
      eventos,
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

    return {
      message: 'Evento actualizado exitosamente',
      status: 'success',
      evento,
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
}
