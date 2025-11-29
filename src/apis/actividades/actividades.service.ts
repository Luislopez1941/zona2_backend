import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { UpdatePublicDto } from './dto/update-public.dto';
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
        } else if (plataformaLower.includes('zona') || plataformaLower.includes('z2')) {
          plataformaNormalizada = 'Z';
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

  async getFeed(runneruid: string, page: number = 1, limit: number = 20, currentUserRunnerUID?: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runneruid },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runneruid} no encontrado`,
      );
    }

    // OPTIMIZACIÓN: Usar una consulta SQL raw con JOIN para obtener todo en una sola consulta
    // Esto es mucho más eficiente que hacer múltiples consultas
    const seguidos = await this.prisma.$queryRaw<Array<{ followed_runnerUID: string }>>`
      SELECT DISTINCT followed_runnerUID 
      FROM followers 
      WHERE follower_runnerUID = ${runneruid}
    `;

    // Si no sigue a nadie, retornar array vacío
    if (seguidos.length === 0) {
      return {
        message: 'Feed obtenido exitosamente',
        status: 'success',
        total: 0,
        page,
        limit,
        runneruid,
        message_info: 'No sigues a ningún usuario',
        actividades: [],
      };
    }

    // Extraer los RunnerUIDs de los usuarios seguidos
    const runnerUIDsSeguidos = seguidos.map((s) => s.followed_runnerUID);

    // Calcular offset para paginación
    const skip = (page - 1) * limit;

    // OPTIMIZACIÓN: Obtener actividades con JOIN en una sola consulta
    // Usar IN clause que es optimizado por MySQL con índices
    const actividades = await this.prisma.actividades.findMany({
      where: {
        RunnerUID: {
          in: runnerUIDsSeguidos,
        },
        Public: true, // Solo actividades públicas
      },
      include: {
        actividad_ruta: {
          orderBy: {
            punto_numero: 'asc',
          },
        },
        actividad_ubicacion: true,
        actividad_zonas: {
          orderBy: {
            zona_numero: 'asc',
          },
        },
      },
      orderBy: {
        fechaActividad: 'desc', // Más recientes primero
      },
      skip, // Paginación
      take: limit, // Límite de resultados
    });

    // Obtener el total para la paginación
    const total = await this.prisma.actividades.count({
      where: {
        RunnerUID: {
          in: runnerUIDsSeguidos,
        },
        Public: true,
      },
    });

    // OPTIMIZACIÓN: Obtener información de usuarios en una sola consulta en lugar de Promise.all
    const runnerUIDsUnicos = [...new Set(actividades.map((a) => a.RunnerUID))];
    const usuariosMap = new Map();

    if (runnerUIDsUnicos.length > 0) {
      const usuarios = await this.prisma.sec_users.findMany({
        where: {
          RunnerUID: {
            in: runnerUIDsUnicos,
          },
        },
        select: {
          RunnerUID: true,
          name: true,
          AliasRunner: true,
          picture: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
          TipoMembresia: true,
        },
      });

      // Crear un mapa para acceso O(1) en lugar de buscar en cada iteración
      usuarios.forEach((u) => usuariosMap.set(u.RunnerUID, u));
    }

    // OPTIMIZACIÓN: Obtener todas las zonas que el usuario actual dio a estas actividades en una sola consulta
    let zonasDelUsuarioMap = new Map<number, boolean>();
    if (currentUserRunnerUID && actividades.length > 0) {
      const actIDs = actividades.map((a) => a.actID);
      const zonasDelUsuario = await this.prisma.zonas_actividades.findMany({
        where: {
          RunnerUID: currentUserRunnerUID,
          actID: {
            in: actIDs,
          },
        },
        select: {
          actID: true,
        },
      });
      // Crear un mapa: actID -> true si el usuario ya dio zonas
      zonasDelUsuario.forEach((z) => zonasDelUsuarioMap.set(z.actID, true));
    }

    // Agregar información del usuario y si ya dio zonas a cada actividad
    const actividadesConUsuario = actividades.map((actividad) => ({
      ...actividad,
      usuario: usuariosMap.get(actividad.RunnerUID) || null,
      hasGivenZonas: currentUserRunnerUID ? (zonasDelUsuarioMap.get(actividad.actID) || false) : false,
    }));

    return {
      message: 'Feed obtenido exitosamente',
      status: 'success',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      runneruid,
      siguiendo: runnerUIDsSeguidos.length,
      actividades: actividadesConUsuario,
    };
  }

  async findByRunnerUID(runneruid: string, currentUserRunnerUID?: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runneruid },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runneruid} no encontrado`,
      );
    }

    // Obtener todas las actividades del usuario con sus relaciones
    const actividades = await this.prisma.actividades.findMany({
      where: { RunnerUID: runneruid },
      include: {
        actividad_ruta: {
          orderBy: {
            punto_numero: 'asc',
          },
        },
        actividad_ubicacion: true,
        actividad_zonas: {
          orderBy: {
            zona_numero: 'asc',
          },
        },
      },
      orderBy: {
        fechaActividad: 'desc',
      },
    });

    // OPTIMIZACIÓN: Obtener todas las zonas que el usuario actual dio a estas actividades en una sola consulta
    let zonasDelUsuarioMap = new Map<number, boolean>();
    if (currentUserRunnerUID && actividades.length > 0) {
      const actIDs = actividades.map((a) => a.actID);
      const zonasDelUsuario = await this.prisma.zonas_actividades.findMany({
        where: {
          RunnerUID: currentUserRunnerUID,
          actID: {
            in: actIDs,
          },
        },
        select: {
          actID: true,
        },
      });
      // Crear un mapa: actID -> true si el usuario ya dio zonas
      zonasDelUsuario.forEach((z) => zonasDelUsuarioMap.set(z.actID, true));
    }

    // Agregar información de si el usuario actual ya dio zonas a cada actividad
    const actividadesConZonas = actividades.map((actividad) => ({
      ...actividad,
      hasGivenZonas: currentUserRunnerUID ? (zonasDelUsuarioMap.get(actividad.actID) || false) : false,
    }));

    return {
      message: 'Actividades obtenidas exitosamente',
      status: 'success',
      total: actividadesConZonas.length,
      runneruid,
      actividades: actividadesConZonas,
    };
  }

  async getFeedPublic(currentUserRunnerUID?: string) {
    // Obtener las 20 actividades públicas más recientes
    const actividades = await this.prisma.actividades.findMany({
      where: {
        Public: true, // Solo actividades públicas
      },
      include: {
        actividad_ruta: {
          orderBy: {
            punto_numero: 'asc',
          },
        },
        actividad_ubicacion: true,
        actividad_zonas: {
          orderBy: {
            zona_numero: 'asc',
          },
        },
      },
      orderBy: {
        fechaActividad: 'desc', // Más recientes primero
      },
      take: 20, // Solo las 20 más recientes
    });

    // OPTIMIZACIÓN: Obtener información de usuarios en una sola consulta
    const runnerUIDsUnicos = [...new Set(actividades.map((a) => a.RunnerUID))];
    const usuariosMap = new Map();

    if (runnerUIDsUnicos.length > 0) {
      const usuarios = await this.prisma.sec_users.findMany({
        where: {
          RunnerUID: {
            in: runnerUIDsUnicos,
          },
        },
        select: {
          RunnerUID: true,
          name: true,
          AliasRunner: true,
          picture: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
          TipoMembresia: true,
        },
      });

      // Crear un mapa para acceso O(1) en lugar de buscar en cada iteración
      usuarios.forEach((u) => usuariosMap.set(u.RunnerUID, u));
    }

    // OPTIMIZACIÓN: Obtener todas las zonas que el usuario actual dio a estas actividades en una sola consulta
    let zonasDelUsuarioMap = new Map<number, boolean>();
    if (currentUserRunnerUID && actividades.length > 0) {
      const actIDs = actividades.map((a) => a.actID);
      const zonasDelUsuario = await this.prisma.zonas_actividades.findMany({
        where: {
          RunnerUID: currentUserRunnerUID,
          actID: {
            in: actIDs,
          },
        },
        select: {
          actID: true,
        },
      });
      // Crear un mapa: actID -> true si el usuario ya dio zonas
      zonasDelUsuario.forEach((z) => zonasDelUsuarioMap.set(z.actID, true));
    }

    // Agregar información del usuario y si ya dio zonas a cada actividad
    const actividadesConUsuario = actividades.map((actividad) => ({
      ...actividad,
      usuario: usuariosMap.get(actividad.RunnerUID) || null,
      hasGivenZonas: currentUserRunnerUID ? (zonasDelUsuarioMap.get(actividad.actID) || false) : false,
    }));

    return {
      message: 'Feed público obtenido exitosamente',
      status: 'success',
      total: actividadesConUsuario.length,
      actividades: actividadesConUsuario,
    };
  }

  async getPublicas(page: number = 1, limit: number = 20) {
    // Calcular offset para paginación
    const skip = (page - 1) * limit;

    // Obtener todas las actividades públicas de todos los usuarios
    const actividades = await this.prisma.actividades.findMany({
      where: {
        Public: true, // Solo actividades públicas
      },
      include: {
        actividad_ruta: {
          orderBy: {
            punto_numero: 'asc',
          },
        },
        actividad_ubicacion: true,
        actividad_zonas: {
          orderBy: {
            zona_numero: 'asc',
          },
        },
      },
      orderBy: {
        fechaActividad: 'desc', // Más recientes primero
      },
      skip, // Paginación
      take: limit, // Límite de resultados
    });

    // Obtener el total para la paginación
    const total = await this.prisma.actividades.count({
      where: {
        Public: true,
      },
    });

    // OPTIMIZACIÓN: Obtener información de usuarios en una sola consulta
    const runnerUIDsUnicos = [...new Set(actividades.map((a) => a.RunnerUID))];
    const usuariosMap = new Map();

    if (runnerUIDsUnicos.length > 0) {
      const usuarios = await this.prisma.sec_users.findMany({
        where: {
          RunnerUID: {
            in: runnerUIDsUnicos,
          },
        },
        select: {
          RunnerUID: true,
          name: true,
          AliasRunner: true,
          picture: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
          TipoMembresia: true,
        },
      });

      // Crear un mapa para acceso O(1) en lugar de buscar en cada iteración
      usuarios.forEach((u) => usuariosMap.set(u.RunnerUID, u));
    }

    // Agregar información del usuario a cada actividad
    const actividadesConUsuario = actividades.map((actividad) => ({
      ...actividad,
      usuario: usuariosMap.get(actividad.RunnerUID) || null,
    }));

    return {
      message: 'Actividades públicas obtenidas exitosamente',
      status: 'success',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actividades: actividadesConUsuario,
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

  async updatePublic(runneruid: string, updatePublicDto: UpdatePublicDto) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runneruid },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runneruid} no encontrado`,
      );
    }

    // Determinar el valor de Public (por defecto true si no se especifica)
    const publico = updatePublicDto.Publico !== undefined ? updatePublicDto.Publico : true;

    // Si se proporciona un actID específico
    if (updatePublicDto.actID) {
      // Verificar que la actividad existe y pertenece al usuario
      const actividad = await this.prisma.actividades.findFirst({
        where: {
          actID: updatePublicDto.actID,
          RunnerUID: runneruid,
        },
      });

      if (!actividad) {
        throw new NotFoundException(
          `Actividad con ID ${updatePublicDto.actID} no encontrada o no pertenece al usuario`,
        );
      }

      // Actualizar la actividad
      const actividadActualizada = await this.prisma.actividades.update({
        where: { actID: updatePublicDto.actID },
        data: { Public: publico },
      });

      return {
        message: `Actividad ${publico ? 'publicada' : 'ocultada'} exitosamente`,
        status: 'success',
        actividad: actividadActualizada,
      };
    }

    // Si se proporciona un array de actIDs
    if (updatePublicDto.actIDs && updatePublicDto.actIDs.length > 0) {
      // Verificar que todas las actividades pertenezcan al usuario
      const actividades = await this.prisma.actividades.findMany({
        where: {
          actID: { in: updatePublicDto.actIDs },
          RunnerUID: runneruid,
        },
      });

      if (actividades.length !== updatePublicDto.actIDs.length) {
        throw new BadRequestException(
          'Algunas actividades no existen o no pertenecen al usuario',
        );
      }

      // Actualizar todas las actividades
      await this.prisma.actividades.updateMany({
        where: {
          actID: { in: updatePublicDto.actIDs },
          RunnerUID: runneruid,
        },
        data: { Public: publico },
      });

      return {
        message: `${actividades.length} actividad(es) ${publico ? 'publicada(s)' : 'ocultada(s)'} exitosamente`,
        status: 'success',
        total: actividades.length,
      };
    }

    // Si no se proporciona actID ni actIDs, actualizar todas las actividades del usuario
    const resultado = await this.prisma.actividades.updateMany({
      where: {
        RunnerUID: runneruid,
      },
      data: { Public: publico },
    });

    return {
      message: `${resultado.count} actividad(es) ${publico ? 'publicada(s)' : 'ocultada(s)'} exitosamente`,
      status: 'success',
      total: resultado.count,
    };
  }
}
