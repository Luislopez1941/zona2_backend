import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstadosMexicoDto } from './dto/create-estados_mexico.dto';
import { UpdateEstadosMexicoDto } from './dto/update-estados_mexico.dto';

@Injectable()
export class EstadosMexicoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEstadosMexicoDto: CreateEstadosMexicoDto) {
    const estado = await this.prisma.estados_mexico.create({
      data: createEstadosMexicoDto,
    });

    return {
      message: 'Estado creado exitosamente',
      status: 'success',
      estado,
    };
  }

  async findAll() {
    const estados = await this.prisma.estados_mexico.findMany({
      orderBy: {
        Nombre: 'asc',
      },
    });

    return {
      message: 'Estados obtenidos exitosamente',
      status: 'success',
      total: estados.length,
      estados,
    };
  }

  async findOne(id: number) {
    const estado = await this.prisma.estados_mexico.findUnique({
      where: { EstadoID: id },
    });

    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id} no encontrado`);
    }

    return {
      message: 'Estado obtenido exitosamente',
      status: 'success',
      estado,
    };
  }

  async update(id: number, updateEstadosMexicoDto: UpdateEstadosMexicoDto) {
    await this.findOne(id); // Verificar que existe

    const estado = await this.prisma.estados_mexico.update({
      where: { EstadoID: id },
      data: updateEstadosMexicoDto,
    });

    return {
      message: 'Estado actualizado exitosamente',
      status: 'success',
      estado,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    await this.prisma.estados_mexico.delete({
      where: { EstadoID: id },
    });

    return {
      message: 'Estado eliminado exitosamente',
      status: 'success',
    };
  }
}
