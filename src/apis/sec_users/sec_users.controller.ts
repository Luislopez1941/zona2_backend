import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecUsersService } from './sec_users.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { DarZonaDto } from './dto/dar-zona.dto';

@Controller('sec-users')
export class SecUsersController {
  constructor(private readonly secUsersService: SecUsersService) {}

  @Post('pre-register')
  preRegister(@Body() createSecUserDto: CreateSecUserDto) {
    return this.secUsersService.create(createSecUserDto);
  }

  @Post('create')
  create(@Body() createSecUserDto: CreateSecUserDto) {
    return this.secUsersService.create(createSecUserDto);
  }

  @Post('dar-zona')
  darZona(@Body() darZonaDto: DarZonaDto) {
    return this.secUsersService.darZona(darZonaDto.runnerUIDA, darZonaDto.runnerUID);
  }

  @Get()
  findAll() {
    return this.secUsersService.findAll();
  }

  @Get(':login')
  findOne(@Param('login') login: string) {
    return this.secUsersService.findOne(login);
  }

  @Patch(':login')
  update(@Param('login') login: string, @Body() updateSecUserDto: UpdateSecUserDto) {
    return this.secUsersService.update(login, updateSecUserDto);
  }

  @Delete(':login')
  remove(@Param('login') login: string) {
    return this.secUsersService.remove(login);
  }
}
