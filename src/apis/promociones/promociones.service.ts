import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromocioneDto } from './dto/create-promocione.dto';
import { UpdatePromocioneDto } from './dto/update-promocione.dto';
import { promociones_Estatus } from '@prisma/client';

@Injectable()
export class PromocionesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
