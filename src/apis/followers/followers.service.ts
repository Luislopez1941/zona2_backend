import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(follower_runnerUID: string, followed_runnerUID: string) {
    // Verificar que el usuario que sigue existe
    const follower = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: follower_runnerUID },
    });

    if (!follower) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${follower_runnerUID} no encontrado`,
      );
    }

    // Verificar que el usuario a seguir existe
    const followed = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: followed_runnerUID },
    });

    if (!followed) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${followed_runnerUID} no encontrado`,
      );
    }

    // No permitir seguirse a sí mismo
    if (follower_runnerUID === followed_runnerUID) {
      throw new ConflictException('No puedes seguirte a ti mismo');
    }

    // Verificar si ya lo sigue
    const existingFollow = await this.prisma.followers.findFirst({
      where: {
        follower_runnerUID,
        followed_runnerUID,
      },
    });

    if (existingFollow) {
      throw new ConflictException('Ya sigues a este usuario');
    }

    // Crear la relación de seguimiento (esto crea el registro en la tabla Followers)
    const follow = await this.prisma.followers.create({
      data: {
        follower_runnerUID,
        followed_runnerUID,
      },
    });

    return {
      message: 'Usuario seguido exitosamente',
      status: 'success',
      follow,
    };
  }

  async unfollow(follower_runnerUID: string, followed_runnerUID: string) {
    // Verificar que la relación existe
    const follow = await this.prisma.followers.findFirst({
      where: {
        follower_runnerUID,
        followed_runnerUID,
      },
    });

    if (!follow) {
      throw new NotFoundException('No sigues a este usuario');
    }

    // Eliminar la relación (elimina el registro de la tabla Followers)
    await this.prisma.followers.delete({
      where: {
        id: follow.id,
      },
    });

    return {
      message: 'Usuario dejado de seguir exitosamente',
      status: 'success',
    };
  }

  async getFollowing(runneruid: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runneruid },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runneruid} no encontrado`,
      );
    }

    // Obtener todos los usuarios que sigue (consulta la tabla Followers)
    const following = await this.prisma.followers.findMany({
      where: { follower_runnerUID: runneruid },
      select: { followed_runnerUID: true },
    });

    // Obtener información de los usuarios seguidos
    const runnerUIDsSeguidos = following.map((f) => f.followed_runnerUID);

    const usuariosSeguidos = await Promise.all(
      runnerUIDsSeguidos.map(async (runnerUID) => {
        const usuario = await this.prisma.sec_users.findFirst({
          where: { RunnerUID: runnerUID },
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
        return usuario;
      }),
    );

    return {
      message: 'Usuarios seguidos obtenidos exitosamente',
      status: 'success',
      total: usuariosSeguidos.length,
      runneruid,
      following: usuariosSeguidos.filter((u) => u !== null),
    };
  }

  async getFollowers(runneruid: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runneruid },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runneruid} no encontrado`,
      );
    }

    // Obtener todos los usuarios que lo siguen (consulta la tabla Followers)
    const followers = await this.prisma.followers.findMany({
      where: { followed_runnerUID: runneruid },
      select: { follower_runnerUID: true },
    });

    // Obtener información de los seguidores
    const runnerUIDsSeguidores = followers.map((f) => f.follower_runnerUID);

    const usuariosSeguidores = await Promise.all(
      runnerUIDsSeguidores.map(async (runnerUID) => {
        const usuario = await this.prisma.sec_users.findFirst({
          where: { RunnerUID: runnerUID },
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
        return usuario;
      }),
    );

    return {
      message: 'Seguidores obtenidos exitosamente',
      status: 'success',
      total: usuariosSeguidores.length,
      runneruid,
      followers: usuariosSeguidores.filter((u) => u !== null),
    };
  }

  async isFollowing(follower_runnerUID: string, followed_runnerUID: string) {
    const follow = await this.prisma.followers.findFirst({
      where: {
        follower_runnerUID,
        followed_runnerUID,
      },
    });

    return {
      message: 'Estado de seguimiento obtenido exitosamente',
      status: 'success',
      isFollowing: !!follow,
    };
  }
}
