import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { FolloersService } from './folloers.service';
import { CreateFolloerDto } from './dto/create-folloer.dto';

@Controller('folloers')
export class FolloersController {
  constructor(private readonly folloersService: FolloersService) {}

  // Endpoint para seguir a un usuario (crea un registro en la tabla Followers)
  @Post('follow/:follower_runnerUID')
  follow(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Body() createFolloerDto: CreateFolloerDto,
  ) {
    return this.folloersService.follow(
      follower_runnerUID,
      createFolloerDto.followed_runnerUID,
    );
  }

  // Endpoint para dejar de seguir a un usuario (elimina el registro de Followers)
  @Delete('unfollow/:follower_runnerUID/:followed_runnerUID')
  unfollow(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Param('followed_runnerUID') followed_runnerUID: string,
  ) {
    return this.folloersService.unfollow(follower_runnerUID, followed_runnerUID);
  }

  // Endpoint para obtener todos los usuarios que sigo
  @Get('following/:runneruid')
  getFollowing(@Param('runneruid') runneruid: string) {
    return this.folloersService.getFollowing(runneruid);
  }

  // Endpoint para obtener todos mis seguidores
  @Get('followers/:runneruid')
  getFollowers(@Param('runneruid') runneruid: string) {
    return this.folloersService.getFollowers(runneruid);
  }

  // Endpoint para verificar si sigo a un usuario específico
  @Get('is-following/:follower_runnerUID/:followed_runnerUID')
  isFollowing(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Param('followed_runnerUID') followed_runnerUID: string,
  ) {
    return this.folloersService.isFollowing(
      follower_runnerUID,
      followed_runnerUID,
    );
  }
}
