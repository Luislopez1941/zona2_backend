import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { JwtStrategy } from '../jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-secret-key-cambiar-en-produccion',
      signOptions: { expiresIn: '7d' }, // El token expira en 7 días
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy],
  exports: [LoginService],
})
export class LoginModule {}
