import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRutaDto: CreateRutaDto) {
    return 'This action adds a new ruta';
  }

  async findAll() {
    const rutas = await this.prisma.rutas.findMany({
      where: {
        Estatus: 'Publica', // Solo rutas públicas
      },
      orderBy: {
        FechaCreacion: 'desc',
      },
    });

    // Convertir GPXfile (Buffer) a base64 si existe
    const rutasConGPX = rutas.map((ruta) => ({
      ...ruta,
      GPXfile: ruta.GPXfile ? Buffer.from(ruta.GPXfile).toString('base64') : null,
    }));

    return {
      message: 'Rutas obtenidas exitosamente',
      status: 'success',
      total: rutasConGPX.length,
      rutas: rutasConGPX,
    };
  }

  /**
   * Obtiene rutas por país
   */
  async findByPais(pais: string) {
    const rutas = await this.prisma.rutas.findMany({
      where: {
        Pais: pais,
        Estatus: 'Publica', // Solo rutas públicas
      },
      orderBy: {
        FechaCreacion: 'desc',
      },
    });

    // Convertir GPXfile (Buffer) a base64 si existe
    const rutasConGPX = rutas.map((ruta) => ({
      ...ruta,
      GPXfile: ruta.GPXfile ? Buffer.from(ruta.GPXfile).toString('base64') : null,
    }));

    return {
      message: 'Rutas obtenidas exitosamente',
      status: 'success',
      total: rutasConGPX.length,
      pais,
      rutas: rutasConGPX,
    };
  }

  /**
   * Obtiene rutas por ciudad
   */
  async findByCiudad(ciudad: string) {
    const rutas = await this.prisma.rutas.findMany({
      where: {
        Ciudad: ciudad,
        Estatus: 'Publica', // Solo rutas públicas
      },
      orderBy: {
        FechaCreacion: 'desc',
      },
    });

    // Convertir GPXfile (Buffer) a base64 si existe
    const rutasConGPX = rutas.map((ruta) => ({
      ...ruta,
      GPXfile: ruta.GPXfile ? Buffer.from(ruta.GPXfile).toString('base64') : null,
    }));

    return {
      message: 'Rutas obtenidas exitosamente',
      status: 'success',
      total: rutasConGPX.length,
      ciudad,
      rutas: rutasConGPX,
    };
  }

  /**
   * Obtiene rutas por estado
   */
  async findByEstado(estado: string) {
    const rutas = await this.prisma.rutas.findMany({
      where: {
        Estado: estado,
        Estatus: 'Publica', // Solo rutas públicas
      },
      orderBy: {
        FechaCreacion: 'desc',
      },
    });

    // Convertir GPXfile (Buffer) a base64 si existe
    const rutasConGPX = rutas.map((ruta) => ({
      ...ruta,
      GPXfile: ruta.GPXfile ? Buffer.from(ruta.GPXfile).toString('base64') : null,
    }));

    return {
      message: 'Rutas obtenidas exitosamente',
      status: 'success',
      total: rutasConGPX.length,
      estado,
      rutas: rutasConGPX,
    };
  }

  async findOne(id: number) {
    const ruta = await this.prisma.rutas.findUnique({
      where: { RutaID: id },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    // Convertir GPXfile (Buffer) a base64 si existe
    const rutaConGPX = {
      ...ruta,
      GPXfile: ruta.GPXfile ? Buffer.from(ruta.GPXfile).toString('base64') : null,
    };

    return {
      message: 'Ruta obtenida exitosamente',
      status: 'success',
      ruta: rutaConGPX,
    };
  }

  update(id: number, updateRutaDto: UpdateRutaDto) {
    return `This action updates a #${id} ruta`;
  }

  remove(id: number) {
    return `This action removes a #${id} ruta`;
  }
}
