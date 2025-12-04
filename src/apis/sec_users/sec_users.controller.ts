import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Req, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { SecUsersService } from './sec_users.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { DarZonaDto } from './dto/dar-zona.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyRecoveryCodeDto } from './dto/verify-recovery-code.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateOrganizadorDto } from './dto/create-organizador.dto';
import { UpdatePeacerDto } from './dto/update-peacer.dto';
import { JoinATeamDto } from '../equipos/dto/join-a-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Extender el tipo Request para incluir el usuario del JWT
interface RequestWithUser extends Request {
  user: {
    login: string;
    [key: string]: any;
  };
  }

  @Controller('sec-users')
  export class SecUsersController {
  constructor(private readonly secUsersService: SecUsersService) {}

  @Post('pre-register')
  preRegister(@Body() createSecUserDto: CreateSecUserDto) {
    return this.secUsersService.preRegister(createSecUserDto);
  }

  @Post('update-peacer')
  updatePeacer(@Body() updatePeacerDto: UpdatePeacerDto) {
    return this.secUsersService.updatePeacer(updatePeacerDto);
  }

  @Post('organizers-register')
  organizers(@Body() createOrganizadorDto: CreateOrganizadorDto) {
    return this.secUsersService.createOrganizador(createOrganizadorDto);
  }

  @Post('establishments-register')
  establishmentsRegister(@Body() createOrganizadorDto: CreateOrganizadorDto) {
    return this.secUsersService.createEstablecimiento(createOrganizadorDto);
  }

  @Post('create')
  create(@Body() createSecUserDto: CreateSecUserDto) {
    return this.secUsersService.create(createSecUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: RequestWithUser) {
    // req.user viene del JwtStrategy.validate() después de validar el token
    // El guard JWT garantiza que req.user existe
    if (!req.user || !req.user.login) {
      throw new Error('Usuario no autenticado');
    }
    return this.secUsersService.me(req.user.login);
  }

  @Post('send-recovery-code')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    // Usar login si está presente, sino usar phone
    const identifier = forgetPasswordDto.login || forgetPasswordDto.phone;
    if (!identifier) {
      return {
        message: 'Se requiere phone o login',
        status: 'error',
        exists: false,
      };
    }
    return this.secUsersService.forgetPassword(identifier);
  }

  @Get('get-by-id/:id')
  getById(@Param('id') id: string) {
    return this.secUsersService.getById(id);
  }

  @Post('verify-recovery-code')
  verifyRecoveryCode(@Body() verifyRecoveryCodeDto: VerifyRecoveryCodeDto) {
    return this.secUsersService.verifyRecoveryCode(
      verifyRecoveryCodeDto.phone,
      verifyRecoveryCodeDto.code,
    );
  }
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ChangePasswordDto) {
    // Usar login si está presente, sino usar phone
    const identifier = resetPasswordDto.login || resetPasswordDto.phone;
    if (!identifier) {
      return {
        message: 'Se requiere phone o login',
        status: 'error',
        changed: false,
      };
    }

    // Validar que el código esté presente
    if (!resetPasswordDto.code) {
      return {
        message: 'El código de recuperación es requerido',
        status: 'error',
        changed: false,
      };
    }

    // password es la nueva contraseña que envía el frontend
    return this.secUsersService.changePassword(identifier, resetPasswordDto.code, resetPasswordDto.password);
  }
 

  // @Patch(':login')
  // update(@Param('login') login: string, @Body() updateSecUserDto: UpdateSecUserDto) {
  //   return this.secUsersService.update(login, updateSecUserDto);
  // }

  @Put('update/:RunnerUID')
  update(@Param('RunnerUID') RunnerUID: string, @Body() updateSecUserDto: UpdateSecUserDto) {
    return this.secUsersService.updateByRunnerUID(RunnerUID, updateSecUserDto);
  }
  
  @Delete(':login')
  remove(@Param('login') login: string) {
    return this.secUsersService.remove(login);
  }

  // Obtener cantidad de referidos de un usuario
  @Get('referidos/:runnerUID')
  getReferidosCount(@Param('runnerUID') runnerUID: string) {
    return this.secUsersService.getReferidosCount(runnerUID);
  }

  // Obtener ganancias totales de los referidos
  @Get('ganancias-referidos/:runnerUID')
  getGananciasReferidos(@Param('runnerUID') runnerUID: string) {
    return this.secUsersService.getGananciasReferidos(runnerUID);
  }


  @Get('search')
  searchUsers(
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Validar que el query tenga al menos 2 caracteres
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'El parámetro query debe tener al menos 2 caracteres',
      );
    }

    // Validar y parsear paginación
    let pageNumber = 1;
    let limitNumber = 20; // Por defecto 20 resultados

    if (page) {
      pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new BadRequestException(
          'El parámetro page debe ser un número mayor a 0',
        );
      }
    }

    if (limit) {
      limitNumber = parseInt(limit, 10);
      if (isNaN(limitNumber) || limitNumber < 1) {
        throw new BadRequestException(
          'El parámetro limit debe ser un número mayor a 0',
        );
      }
      // Limitar el máximo de resultados por página para evitar sobrecarga
      const maxLimit = 50;
      limitNumber = limitNumber > maxLimit ? maxLimit : limitNumber;
    }

    return this.secUsersService.searchUsers(
      query.trim(),
      pageNumber,
      limitNumber,
    );
  }




  @Post('join-a-team')
  joinATeam(@Body() joinATeamDto: JoinATeamDto) {
    return this.secUsersService.joinATeam(joinATeamDto);
  }



}
