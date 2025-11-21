import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SecUsersService } from './sec_users.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { DarZonaDto } from './dto/dar-zona.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyRecoveryCodeDto } from './dto/verify-recovery-code.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
    return this.secUsersService.create(createSecUserDto);
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

  @Patch(':login')
  update(@Param('login') login: string, @Body() updateSecUserDto: UpdateSecUserDto) {
    return this.secUsersService.update(login, updateSecUserDto);
  }

  @Delete(':login')
  remove(@Param('login') login: string) {
    return this.secUsersService.remove(login);
  }
}
