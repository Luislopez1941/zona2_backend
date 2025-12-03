import { Injectable } from '@nestjs/common';
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
      select: {
        RutaID: true,
        RunnerUID: true,
        NombreRuta: true,
        Descripcion: true,
        Disciplina: true,
        DistanciaKM: true,
        ElevacionM: true,
        Dificultad: true,
        DuracionEstimadoMin: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        GoogleMaps: true,
        Estatus: true,
        FechaCreacion: true,
        FechaActualizacion: true,
        GPXfile_name: true,
        // No incluir GPXfile (archivo binario) en la lista para evitar payload grande
      },
    });

    return {
      message: 'Rutas obtenidas exitosamente',
      status: 'success',
      total: rutas.length,
      rutas,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} ruta`;
  }

  update(id: number, updateRutaDto: UpdateRutaDto) {
    return `This action updates a #${id} ruta`;
  }

  remove(id: number) {
    return `This action removes a #${id} ruta`;
  }
}
