import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePecerDto } from './dto/create-pecer.dto';
import { UpdatePecerDto } from './dto/update-pecer.dto';

@Injectable()
export class PecersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPecerDto: CreatePecerDto) {
    const { RunnerUID, ...rest } = createPecerDto;

    // 1. Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // 2. Verificar si el usuario ya es un pacer
    const pacerExistente = await this.prisma.pacers.findFirst({
      where: { RunnerUID },
    });

    if (pacerExistente) {
      throw new ConflictException(`El usuario con RunnerUID ${RunnerUID} ya es un pacer`);
    }

    // 3. Actualizar TipoMembresia a 'P' en sec_users
    await this.prisma.sec_users.update({
      where: { login: usuario.login },
      data: { TipoMembresia: 'P' },
    });

    // 4. Obtener datos del usuario para completar la información del pacer
    const NombreCompleto = usuario.name || 'Sin nombre';
    const CiudadBase = rest.CiudadBase || usuario.Ciudad || null;
    const EstadoBase = rest.EstadoBase || usuario.Estado || null;
    const PaisBase = rest.PaisBase || usuario.Pais || 'México';

    // 5. Crear el pacer
    const pacer = await this.prisma.pacers.create({
      data: {
        RunnerUID,
        NombreCompleto,
        AliasPacer: rest.AliasPacer || null,
        Biografia: rest.Biografia || null,
        Idiomas: rest.Idiomas || null,
        RitmoMin: rest.RitmoMin || null,
        DistanciasDominadas: rest.DistanciasDominadas || null,
        Certificaciones: rest.Certificaciones || null,
        CiudadBase,
        EstadoBase,
        PaisBase,
        DisponibilidadHoraria: rest.DisponibilidadHoraria || null,
        PickUpHotel: rest.PickUpHotel || false,
        FotoPerfilURL: rest.FotoPerfilURL || null,
        RedesSociales: rest.RedesSociales || null,
        Tarifabase: rest.Tarifabase || null,
        CalificacionPromedio: 0.00,
        TotalReviews: 0,
        TotalExperienciasRealizadas: 0,
        PacerActivo: true,
      },
    });

    return {
      message: 'Pacer creado exitosamente',
      status: 'success',
      pacer,
    };
  }

  findAll() {
    return `This action returns all pecers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pecer`;
  }

  update(id: number, updatePecerDto: UpdatePecerDto) {
    return `This action updates a #${id} pecer`;
  }

  remove(id: number) {
    return `This action removes a #${id} pecer`;
  }
}
