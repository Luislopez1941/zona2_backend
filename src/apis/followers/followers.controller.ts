import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { CreateFollowerDto } from './dto/create-followers.dto';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  // Endpoint para seguir a un usuario (crea un registro en la tabla Followers)
  @Post('follow/:follower_runnerUID')
  follow(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Body() createFollowerDto: CreateFollowerDto,
  ) {
    return this.followersService.follow(
      follower_runnerUID,
      createFollowerDto.followed_runnerUID,
    );
  }

  // Endpoint para dejar de seguir a un usuario (elimina el registro de Followers)
  @Delete('unfollow/:follower_runnerUID/:followed_runnerUID')
  unfollow(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Param('followed_runnerUID') followed_runnerUID: string,
  ) {
    return this.followersService.unfollow(follower_runnerUID, followed_runnerUID);
  }

  // Endpoint para obtener todos los usuarios que sigo
  @Get('following/:runneruid')
  getFollowing(@Param('runneruid') runneruid: string) {
    return this.followersService.getFollowing(runneruid);
  }

  // Endpoint para obtener todos mis seguidores
  @Get('followers/:runneruid')
  getFollowers(@Param('runneruid') runneruid: string) {
    return this.followersService.getFollowers(runneruid);
  }

  // Endpoint para verificar si sigo a un usuario específico
  @Get('is-following/:follower_runnerUID/:followed_runnerUID')
  isFollowing(
    @Param('follower_runnerUID') follower_runnerUID: string,
    @Param('followed_runnerUID') followed_runnerUID: string,
  ) {
    return this.followersService.isFollowing(
      follower_runnerUID,
      followed_runnerUID,
    );
  }
}
