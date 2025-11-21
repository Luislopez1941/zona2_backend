import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-secret-key-cambiar-en-produccion',
    });
  }

  async validate(payload: any) {
    // El payload contiene los datos que pusimos en el token (login, etc.)
    const user = await this.prisma.sec_users.findUnique({
      where: { login: payload.login },
    });

    if (!user) {
      return null;
    }

    // Retornar solo los datos necesarios, sin la contraseña
    const { pswd, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

