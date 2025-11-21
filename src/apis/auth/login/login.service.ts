import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { SetupMfaDto } from './dto/setup-mfa.dto';
import { LoginValidationDto } from './dto/login-validation.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { SmsService } from '../../../common/services/sms.service';
import { createHash } from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

interface OtpData {
  code: string;
  phone: string;
  login: string;
  expiresAt: Date;
}

@Injectable()
export class LoginService {
  // Almacenamiento temporal de códigos OTP (en producción usar Redis)
  private otpStorage: Map<string, OtpData> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {
    // Limpiar códigos OTP expirados cada minuto
    setInterval(() => {
      this.cleanExpiredOtps();
    }, 60000);
  }

  async create(createLoginDto: CreateLoginDto) {
    const { phone, login, password, code } = createLoginDto;

    // Usar login si está presente, sino usar phone
    const identifier = login || phone;
    if (!identifier) {
      return {
        message: 'Se requiere phone o login',
        status: 'error',
        user: undefined,
      };
    }

    // Hashear la contraseña con SHA1 para comparar
    const hashedPassword = createHash('sha1').update(password).digest('hex');

    // Buscar usuario por login o número telefónico
    const user = await this.prisma.sec_users.findFirst({
      where: {
        OR: [
          { login: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) {
      return {
        message: 'Usuario no encontrado',
        status: 'error',
        user: undefined,
      };
    }

    // Verificar si el usuario está activo
    // Si active es null/undefined, se considera activo por defecto
    // Solo se considera inactivo si active es explícitamente '0' o 'N'
    const isInactive = user.active === '0' || user.active === 'N';
    
    if (isInactive) {
      return {
        message: 'Usuario inactivo',
        status: 'error',
        user: undefined,
      };
    }

    // Verificar contraseña
    if (user.pswd !== hashedPassword) {
      return {
        message: 'Contraseña incorrecta',
        status: 'error',
        user: undefined,
      };
    }

    // Si el usuario tiene MFA configurado, verificar el código 2FA
    if (user.mfa) {
      if (!code) {
        return {
          message: 'Código 2FA requerido',
          status: 'error',
          user: undefined,
        };
      }

      // Verificar el código 2FA
      const verified = speakeasy.totp.verify({
        secret: user.mfa,
        encoding: 'base32',
        token: code,
        window: 2, // Permite códigos de los últimos 2 períodos (60 segundos)
      });

      if (!verified) {
        return {
          message: 'Código 2FA incorrecto',
          status: 'error',
          user: undefined,
        };
      }
    }

    // Login exitoso - generar token JWT
    const { pswd, ...userWithoutPassword } = user;

    // Generar token JWT con los datos del usuario
    const payload = {
      login: user.login,
      RunnerUID: user.RunnerUID,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login exitoso',
      status: 'success',
      user: userWithoutPassword,
      token: token, // Token JWT para usar en las siguientes peticiones
    };
  }

  async setupMfa(setupMfaDto: SetupMfaDto) {
    const { phone } = setupMfaDto;

    // Buscar usuario por número telefónico
    const user = await this.prisma.sec_users.findFirst({
      where: {
        phone: phone,
      },
    });

    if (!user) {
      return {
        message: 'Usuario no encontrado',
        status: 'error',
        qrCode: undefined,
        secret: undefined,
      };
    }

    // Generar secreto para 2FA
    const secret = speakeasy.generateSecret({
      name: `Zona 2 (${user.name || user.login})`,
      issuer: 'Zona 2',
      length: 32,
    });

    // Generar QR code
    let qrCodeUrl: string;
    try {
      qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    } catch (error) {
      return {
        message: 'Error al generar QR code',
        status: 'error',
        qrCode: undefined,
        secret: undefined,
      };
    }

    // Guardar el secreto en la base de datos (solo la parte base32)
    await this.prisma.sec_users.update({
      where: { login: user.login },
      data: {
        mfa: secret.base32,
        mfa_last_updated: new Date(),
      },
    });

    return {
      message: 'MFA configurado exitosamente',
      status: 'success',
      qrCode: qrCodeUrl,
      secret: secret.base32, // Solo para debugging, normalmente no se devuelve
    };
  }

  async verifyMfa(phone: string, code: string) {
    // Buscar usuario por número telefónico
    const user = await this.prisma.sec_users.findFirst({
      where: {
        phone: phone,
      },
    });

    if (!user || !user.mfa) {
      return {
        message: 'Usuario no encontrado o MFA no configurado',
        status: 'error',
        verified: false,
      };
    }

    // Verificar el código 2FA
    const verified = speakeasy.totp.verify({
      secret: user.mfa,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    return {
      message: verified ? 'Código 2FA válido' : 'Código 2FA inválido',
      status: verified ? 'success' : 'error',
      verified: verified,
    };
  }

  /**
   * Valida el número de teléfono/login y envía código OTP por SMS
   */
  async loginValidation(loginValidationDto: LoginValidationDto) {
    const { phone, login, password } = loginValidationDto;

    // Usar login si está presente, sino usar phone
    const identifier = login || phone;
    if (!identifier) {
      return {
        message: 'Se requiere phone o login',
        status: 'error',
        phone: undefined,
      };
    }

    // Buscar usuario por login o número telefónico
    const user = await this.prisma.sec_users.findFirst({
      where: {
        OR: [
          { login: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) {
      return {
        message: 'Usuario no encontrado',
        status: 'error',
        phone: undefined,
      };
    }

    // Verificar si el usuario está activo
    const isInactive = user.active === '0' || user.active === 'N';
    
    if (isInactive) {
      return {
        message: 'Usuario inactivo',
        status: 'error',
        phone: undefined,
      };
    }

    // Si se proporciona password, validarlo antes de enviar OTP
    if (password) {
      const hashedPassword = createHash('sha1').update(password).digest('hex');
      if (user.pswd !== hashedPassword) {
        return {
          message: 'Contraseña incorrecta',
          status: 'error',
          phone: undefined,
        };
      }
    }

    // Generar código OTP de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código OTP con expiración de 10 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpKey = user.phone || user.login;
    this.otpStorage.set(otpKey, {
      code: otpCode,
      phone: user.phone,
      login: user.login,
      expiresAt,
    });

    // Enviar código OTP por SMS
    console.log('=== DEBUG loginValidation ===');
    console.log('Usuario encontrado:', user.login);
    console.log('Código generado:', otpCode);
    console.log('Enviando SMS a:', user.phone);
    
    const smsSent = await this.smsService.sendOtpCode(user.phone, otpCode);

    if (!smsSent) {
      console.error('❌ No se pudo enviar el SMS');
      return {
        message: 'Error al enviar código por SMS',
        status: 'error',
        phone: undefined,
      };
    }

    console.log('✅ SMS enviado correctamente');
    console.log('===========================');

    // Retornar el número de teléfono (o login) encontrado
    return {
      message: 'Código OTP enviado exitosamente',
      status: 'success',
      phone: user.phone,
      login: user.login,
    };
  }

  /**
   * Valida el código OTP y genera el token JWT
   */
  async loginWithOtp(loginOtpDto: LoginOtpDto) {
    const { phone, login, code } = loginOtpDto;

    // Usar login si está presente, sino usar phone
    const identifier = login || phone;
    if (!identifier) {
      return {
        message: 'Se requiere phone o login',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    if (!code) {
      return {
        message: 'Código OTP requerido',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Buscar el código OTP almacenado
    const otpKey = identifier;
    const otpData = this.otpStorage.get(otpKey);

    if (!otpData) {
      return {
        message: 'Código OTP no encontrado o expirado',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Verificar si el código OTP ha expirado
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(otpKey);
      return {
        message: 'Código OTP expirado',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Verificar el código OTP
    if (otpData.code !== code) {
      return {
        message: 'Código OTP incorrecto',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Buscar usuario por login o número telefónico
    const user = await this.prisma.sec_users.findFirst({
      where: {
        OR: [
          { login: otpData.login },
          { phone: otpData.phone },
        ],
      },
    });

    if (!user) {
      this.otpStorage.delete(otpKey);
      return {
        message: 'Usuario no encontrado',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Verificar si el usuario está activo
    const isInactive = user.active === '0' || user.active === 'N';
    
    if (isInactive) {
      this.otpStorage.delete(otpKey);
      return {
        message: 'Usuario inactivo',
        status: 'error',
        user: undefined,
        token: undefined,
      };
    }

    // Código OTP válido - eliminar de almacenamiento
    this.otpStorage.delete(otpKey);

    // Login exitoso - generar token JWT
    const { pswd, ...userWithoutPassword } = user;

    // Generar token JWT con los datos del usuario
    const payload = {
      login: user.login,
      RunnerUID: user.RunnerUID,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login exitoso',
      status: 'success',
      user: userWithoutPassword,
      token: token,
    };
  }

  /**
   * Limpia los códigos OTP expirados del almacenamiento
   */
  private cleanExpiredOtps() {
    const now = new Date();
    for (const [key, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(key);
      }
    }
  }
}
