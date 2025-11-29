import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaiseDto } from './dto/create-paise.dto';
import { UpdatePaiseDto } from './dto/update-paise.dto';

@Injectable()
export class PaisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaiseDto: CreatePaiseDto) {
    const pais = await this.prisma.paises.create({
      data: createPaiseDto,
    });

    return {
      message: 'País creado exitosamente',
      status: 'success',
      pais,
    };
  }

  async findAll() {
    const paises = await this.prisma.paises.findMany({
      orderBy: {
        Nombre: 'asc',
      },
    });

    return {
      message: 'Países obtenidos exitosamente',
      status: 'success',
      total: paises.length,
      paises,
    };
  }

  async findOne(id: number) {
    const pais = await this.prisma.paises.findUnique({
      where: { PaisID: id },
    });

    if (!pais) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }

    return {
      message: 'País obtenido exitosamente',
      status: 'success',
      pais,
    };
  }

  async update(id: number, updatePaiseDto: UpdatePaiseDto) {
    await this.findOne(id); // Verificar que existe

    const pais = await this.prisma.paises.update({
      where: { PaisID: id },
      data: updatePaiseDto,
    });

    return {
      message: 'País actualizado exitosamente',
      status: 'success',
      pais,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.paises.delete({
      where: { PaisID: id },
    });

    return {
      message: 'País eliminado exitosamente',
      status: 'success',
    };
  }
}
