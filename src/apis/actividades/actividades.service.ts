import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { subscriptions_Status, actividad_ruta, actividad_ubicacion, actividad_zonas } from '@prisma/client';

@Injectable()
export class ActividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createActividadeDto: CreateActividadeDto) {
    // Verificar que el usuario existe y obtener datos relacionados
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: createActividadeDto.RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${createActividadeDto.RunnerUID} no encontrado`,
      );
    }

    // Obtener datos relacionados en paralelo
    const [
      equipo,
      suscripcion,
      inscripciones,
      zonasTotales,
      actividadesUsuario,
      actividades30d,
    ] = await Promise.all([
      // Equipo del usuario
      usuario.equipoID
        ? this.prisma.equipos.findFirst({
            where: { OrgID: parseInt(usuario.equipoID) },
          })
        : null,
      // Suscripción activa
      this.prisma.subscriptions.findFirst({
        where: {
          RunnerUID: createActividadeDto.RunnerUID,
          Status: subscriptions_Status.Active,
        },
        orderBy: { UpdatedAt: 'desc' },
      }),
      // Inscripciones próximas (próximos 3 eventos)
      this.prisma.inscripciones.findMany({
        where: {
          RunnerUID: createActividadeDto.RunnerUID,
          FechaEvento: {
            gte: new Date(),
          },
        },
        take: 3,
        orderBy: { FechaEvento: 'asc' },
      }),
      // Total de puntos en zonas
      this.prisma.zonas.aggregate({
        where: { RunnerUID: createActividadeDto.RunnerUID },
        _sum: {
          puntos: true,
        },
      }),
      // Total de actividades del usuario
      this.prisma.actividades.count({
        where: { RunnerUID: createActividadeDto.RunnerUID },
      }),
      // Actividades en los últimos 30 días
      this.prisma.actividades.count({
        where: {
          RunnerUID: createActividadeDto.RunnerUID,
          fechaActividad: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Obtener datos de eventos para las inscripciones
    const inscripcionesConEventos = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const evento = await this.prisma.eventos.findUnique({
          where: { EventoID: inscripcion.EventoID },
        });
        return {
          ...inscripcion,
          evento: evento || null,
        };
      }),
    );

    // Crear la actividad y sus registros relacionados en una transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Normalizar plataforma a 1 carácter si viene un string más largo
      let plataformaNormalizada = createActividadeDto.plataforma;
      if (plataformaNormalizada.length > 1) {
        // Convertir nombres comunes a códigos de 1 carácter
        const plataformaLower = plataformaNormalizada.toLowerCase();
        if (plataformaLower.includes('strava')) {
          plataformaNormalizada = 'S';
        } else if (plataformaLower.includes('garmin')) {
          plataformaNormalizada = 'G';
        } else if (plataformaLower.includes('manual')) {
          plataformaNormalizada = 'M';
        } else {
          // Tomar solo el primer carácter
          plataformaNormalizada = plataformaNormalizada.charAt(0).toUpperCase();
        }
      } else {
        plataformaNormalizada = plataformaNormalizada.toUpperCase();
      }

      // Truncar campos que tienen límites de longitud en la BD
      const ciudadTruncada = createActividadeDto.Ciudad.substring(0, 20);
      const paisTruncado = createActividadeDto.Pais.substring(0, 20);
      const origenTruncado = createActividadeDto.Origen.substring(0, 20);

      // Crear la actividad
      const actividad = await tx.actividades.create({
        data: {
          RunnerUID: createActividadeDto.RunnerUID,
          plataforma: plataformaNormalizada,
          titulo: createActividadeDto.titulo,
          fechaActividad: new Date(createActividadeDto.fechaActividad),
          DistanciaKM: createActividadeDto.DistanciaKM,
          RitmoMinKm: createActividadeDto.RitmoMinKm,
          Duracion: createActividadeDto.Duracion,
          Origen: origenTruncado,
          Ciudad: ciudadTruncada,
          Pais: paisTruncado,
          enlace: createActividadeDto.enlace,
          fecha_inicio: createActividadeDto.fecha_inicio
            ? new Date(createActividadeDto.fecha_inicio)
            : null,
          fecha_fin: createActividadeDto.fecha_fin
            ? new Date(createActividadeDto.fecha_fin)
            : null,
          duracion_segundos: createActividadeDto.duracion_segundos,
          duracion_formateada: createActividadeDto.duracion_formateada,
          distancia: createActividadeDto.distancia,
          ritmo: createActividadeDto.ritmo,
          frecuencia_promedio: createActividadeDto.frecuencia_promedio,
          frecuencia_maxima: createActividadeDto.frecuencia_maxima,
          cadencia: createActividadeDto.cadencia,
          calorias: createActividadeDto.calorias,
          zona_activa: createActividadeDto.zona_activa,
          tipo_actividad: createActividadeDto.tipo_actividad,
          fecha_registro: new Date(),
        },
      });

      // Crear puntos de ruta si se proporcionan
      const rutasCreadas: actividad_ruta[] = [];
      if (createActividadeDto.ruta && createActividadeDto.ruta.length > 0) {
        for (const punto of createActividadeDto.ruta) {
          const ruta = await tx.actividad_ruta.create({
            data: {
              actividad_id: actividad.actID,
              punto_numero: punto.punto_numero,
              latitud: punto.latitud,
              longitud: punto.longitud,
            },
          });
          rutasCreadas.push(ruta);
        }
      }

      // Crear ubicación si se proporciona
      let ubicacionCreada: actividad_ubicacion | null = null;
      if (createActividadeDto.ubicacion) {
        ubicacionCreada = await tx.actividad_ubicacion.create({
          data: {
            actividad_id: actividad.actID,
            ciudad: createActividadeDto.ubicacion.ciudad,
            inicio_lat: createActividadeDto.ubicacion.inicio_lat,
            inicio_lon: createActividadeDto.ubicacion.inicio_lon,
            fin_lat: createActividadeDto.ubicacion.fin_lat,
            fin_lon: createActividadeDto.ubicacion.fin_lon,
          },
        });
      }

      // Crear zonas si se proporcionan
      const zonasCreadas: actividad_zonas[] = [];
      if (createActividadeDto.zonas && createActividadeDto.zonas.length > 0) {
        for (const zona of createActividadeDto.zonas) {
          const zonaCreada = await tx.actividad_zonas.create({
            data: {
              actividad_id: actividad.actID,
              zona_numero: zona.zona_numero,
              rango_texto: zona.rango_texto,
              fue_activa: zona.fue_activa,
            },
          });
          zonasCreadas.push(zonaCreada);
        }
      }

      return {
        actividad,
        rutas: rutasCreadas,
        ubicacion: ubicacionCreada,
        zonas: zonasCreadas,
      };
    });

    const actividad = resultado.actividad;

    // Actualizar FechaUltimaActividad del usuario
    await this.prisma.sec_users.updateMany({
      where: { RunnerUID: createActividadeDto.RunnerUID },
      data: {
        FechaUltimaActividad: new Date(createActividadeDto.fechaActividad),
        Actividades30d: actividades30d + 1,
      },
    });

    // Obtener datos del organizador si existe
    const organizador = await this.prisma.organizadores.findFirst({
      where: { RunnerUID: createActividadeDto.RunnerUID },
    });

    // Calcular estadísticas adicionales
    const distanciaTotal = await this.prisma.actividades.aggregate({
      where: { RunnerUID: createActividadeDto.RunnerUID },
      _sum: {
        DistanciaKM: true,
      },
    });

    return {
      message: 'Actividad creada exitosamente',
      status: 'success',
      actividad,
      ruta: resultado.rutas.length > 0 ? resultado.rutas : null,
      ubicacion: resultado.ubicacion,
      zonas: resultado.zonas.length > 0 ? resultado.zonas : null,
      usuario: {
        RunnerUID: usuario.RunnerUID,
        name: usuario.name,
        AliasRunner: usuario.AliasRunner,
        TipoMembresia: usuario.TipoMembresia,
        Ciudad: usuario.Ciudad,
        Estado: usuario.Estado,
        Pais: usuario.Pais,
        WalletPuntos: usuario.WalletPuntos,
        WalletPuntosI: usuario.WalletPuntosI,
        WalletSaldoMXN: usuario.WalletSaldoMXN,
        Z2TotalHistorico: usuario.Z2TotalHistorico,
        Z2Recibidas30d: usuario.Z2Recibidas30d,
        Actividades30d: actividades30d + 1,
      },
      equipo: equipo
        ? {
            OrgID: equipo.OrgID,
            NombreEquipo: equipo.NombreEquipo,
            AliasEquipo: equipo.AliasEquipo,
            Ciudad: equipo.Ciudad,
            Estado: equipo.Estado,
            AtletasActivos: equipo.AtletasActivos,
          }
        : null,
      suscripcion: suscripcion
        ? {
            PlanCode: suscripcion.PlanCode,
            Status: suscripcion.Status,
            BillingCycle: suscripcion.BillingCycle,
            EndAt: suscripcion.EndAt,
          }
        : null,
      inscripciones: inscripcionesConEventos,
      estadisticas: {
        totalActividades: actividadesUsuario + 1,
        actividades30d: actividades30d + 1,
        distanciaTotal: distanciaTotal._sum.DistanciaKM || 0,
        puntosTotales: zonasTotales._sum.puntos || 0,
      },
      organizador: organizador
        ? {
            OrgID: organizador.OrgID,
            NombreComercial: organizador.NombreComercial,
            Estatus: organizador.Estatus,
          }
        : null,
    };
  }

  async findAll() {
    const actividades = await this.prisma.actividades.findMany({
      orderBy: {
        fechaActividad: 'desc',
      },
    });

    return {
      message: 'Actividades obtenidas exitosamente',
      status: 'success',
      total: actividades.length,
      actividades,
    };
  }

  async findOne(id: number) {
    const actividad = await this.prisma.actividades.findUnique({
      where: { actID: id },
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return {
      message: 'Actividad obtenida exitosamente',
      status: 'success',
      actividad,
    };
  }

  async update(id: number, updateActividadeDto: UpdateActividadeDto) {
    await this.findOne(id); // Verificar que existe

    const actividad = await this.prisma.actividades.update({
      where: { actID: id },
      data: updateActividadeDto,
    });

    return {
      message: 'Actividad actualizada exitosamente',
      status: 'success',
      actividad,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.actividades.delete({
      where: { actID: id },
    });

    return {
      message: 'Actividad eliminada exitosamente',
      status: 'success',
    };
  }
}
