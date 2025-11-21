import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { SetupMfaDto } from './dto/setup-mfa.dto';
import { LoginValidationDto } from './dto/login-validation.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login-validation')
  loginValidation(@Body() loginValidationDto: LoginValidationDto) {
    return this.loginService.loginValidation(loginValidationDto);
  }

  @Post('login')
  login(@Body() loginOtpDto: LoginOtpDto) {
    return this.loginService.loginWithOtp(loginOtpDto);
  }


  @Post('setup-mfa')
  setupMfa(@Body() setupMfaDto: SetupMfaDto) {
    return this.loginService.setupMfa(setupMfaDto);
  }

  @Post('verify-mfa')
  verifyMfa(@Body() body: { phone: string; code: string }) {
    return this.loginService.verifyMfa(body.phone, body.code);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    // El usuario viene del JwtStrategy.validate()
    return {
      message: 'Usuario autenticado',
      status: 'success',
      user: req.user,
    };
  }
}
