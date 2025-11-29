import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCiudadesMexicoDto } from './dto/create-ciudades_mexico.dto';
import { UpdateCiudadesMexicoDto } from './dto/update-ciudades_mexico.dto';

@Injectable()
export class CiudadesMexicoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCiudadesMexicoDto: CreateCiudadesMexicoDto) {
    const ciudad = await this.prisma.ciudades_mexico.create({
      data: createCiudadesMexicoDto,
    });

    return {
      message: 'Ciudad creada exitosamente',
      status: 'success',
      ciudad,
    };
  }

  async findAll(estado?: string) {
    const where = estado
      ? {
          Estado: {
            contains: estado,
          },
        }
      : {};

    const ciudades = await this.prisma.ciudades_mexico.findMany({
      where,
      orderBy: [
        { Estado: 'asc' },
        { Ciudad: 'asc' },
      ],
    });

    return {
      message: estado
        ? `Ciudades del estado '${estado}' obtenidas exitosamente`
        : 'Ciudades obtenidas exitosamente',
      status: 'success',
      total: ciudades.length,
      ciudades,
    };
  }

  async findOne(id: number) {
    const ciudad = await this.prisma.ciudades_mexico.findUnique({
      where: { CiudadID: id },
    });

    if (!ciudad) {
      throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
    }

    return {
      message: 'Ciudad obtenida exitosamente',
      status: 'success',
      ciudad,
    };
  }

  async update(id: number, updateCiudadesMexicoDto: UpdateCiudadesMexicoDto) {
    await this.findOne(id); // Verificar que existe

    const ciudad = await this.prisma.ciudades_mexico.update({
      where: { CiudadID: id },
      data: updateCiudadesMexicoDto,
    });

    return {
      message: 'Ciudad actualizada exitosamente',
      status: 'success',
      ciudad,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.ciudades_mexico.delete({
      where: { CiudadID: id },
    });

    return {
      message: 'Ciudad eliminada exitosamente',
      status: 'success',
    };
  }
}
