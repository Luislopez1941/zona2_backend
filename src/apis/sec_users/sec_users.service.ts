import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SecUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un código aleatorio con formato: prefijo + 3 números (65-90) + 3 letras (A-Z)
   */
  private generateCode(prefix: string): string {
    // Genera 3 números aleatorios entre 65 y 90
    const num1 = Math.floor(Math.random() * 26) + 65;
    const num2 = Math.floor(Math.random() * 26) + 65;
    const num3 = Math.floor(Math.random() * 26) + 65;
    
    // Genera 3 letras aleatorias (A-Z)
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    
    return `${prefix}${num1}${num2}${num3}${char1}${char2}${char3}`;
  }

  /**
   * Genera RunnerUID con formato: Z2R + código aleatorio
   */
  private generateRunnerUID(): string {
    return this.generateCode('Z2R');
  }

  /**
   * Genera AliasRunner con formato: R + código aleatorio
   */
  private generateAliasRunner(): string {
    return this.generateCode('R');
  }

  /**
   * Genera una contraseña y la hashea con SHA1
   */
  private generateDefaultPassword(): string {
    // Genera una contraseña aleatoria de 12 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const passwordLength = 12;
    let password = '';
    
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    // Hashear con SHA1 (como en el código PHP original)
    return createHash('sha1').update(password).digest('hex');
  }

  async create(createSecUserDto: CreateSecUserDto) {
    // Verificar si el login ya existe
    const existingUser = await this.prisma.sec_users.findUnique({
      where: { login: createSecUserDto.login },
    });

    if (existingUser) {
      throw new ConflictException(
        `El usuario con login '${createSecUserDto.login}' ya existe`,
      );
    }

    // Generar RunnerUID con formato Z2R...
    const runnerUID = this.generateRunnerUID();
    
    // Generar AliasRunner con formato R...
    const aliasRunner = this.generateAliasRunner();
    
    // Generar contraseña por defecto si no se proporciona (hasheada con SHA1)
    const password = createSecUserDto.pswd 
      ? createHash('sha1').update(createSecUserDto.pswd).digest('hex')
      : this.generateDefaultPassword();
    
    // Calcular fechas
    const now = new Date();
    const fechaRenovacionMembresia = new Date(now);
    fechaRenovacionMembresia.setFullYear(fechaRenovacionMembresia.getFullYear() + 1);
    const fechaUltimaZ2 = now;
    
    // Valores iniciales para zonas
    const puntosIniciales = 10000;
    
    try {
      // Crear usuario y zona inicial en una transacción
      const user = await this.prisma.$transaction(async (tx) => {
        // Crear usuario
        const newUser = await tx.sec_users.create({
          data: {
            RunnerUID: runnerUID,
            AliasRunner: aliasRunner,
            name: createSecUserDto.name,
            login: createSecUserDto.login,
            phone: createSecUserDto.phone,
            email: createSecUserDto.email,
            pswd: password,
            RFC: createSecUserDto.RFC,
            Ciudad: createSecUserDto.Ciudad,
            Pais: createSecUserDto.Pais,
            TipoMembresia: createSecUserDto.TipoMembresia,
            FechaRenovacionMembresia: fechaRenovacionMembresia,
            FechaUltimaZ2: fechaUltimaZ2,
            fechaNacimiento: createSecUserDto.fechaNacimiento 
              ? new Date(createSecUserDto.fechaNacimiento) 
              : null,
            Genero: createSecUserDto.Genero,
            equipoID: createSecUserDto.equipoID,
            RunnerUIDRef: createSecUserDto.RunnerUIDRef,
            // Inicializar campos de zonas
            Z2TotalHistorico: BigInt(puntosIniciales),
            Z2Recibidas30d: puntosIniciales,
            WalletPuntos: puntosIniciales,
          },
        });

        // Crear zona inicial (se refiere a sí mismo)
        await tx.zonas.create({
          data: {
            RunnerUID: runnerUID,
            RunnerUIDRef: runnerUID, // Se refiere a sí mismo en el registro inicial
            puntos: puntosIniciales,
            motivo: 'R', // Registro
            origen: '3', // 3 = Registro
            fecha: fechaUltimaZ2,
          },
        });

        return newUser;
      });

      return user;
    } catch (error) {
      // Manejar errores de Prisma (como violación de restricción única)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          throw new ConflictException(
            `Ya existe un usuario con ${field?.join(', ') || 'estos datos'}`,
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.sec_users.findMany({
      orderBy: {
        FechaRegistro: 'desc',
      },
    });
  }

  async findOne(login: string) {
    const user = await this.prisma.sec_users.findUnique({
      where: { login: login },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con login '${login}' no encontrado`);
    }

    return user;
  }

  async update(login: string, updateSecUserDto: UpdateSecUserDto) {
    await this.findOne(login); // Verificar que el usuario existe

    return this.prisma.sec_users.update({
      where: { login: login },
      data: updateSecUserDto,
    });
  }

  /**
   * Otorga zonas entre dos usuarios
   * @param runnerUIDA RunnerUID de quien otorga (recibe 50 puntos)
   * @param runnerUID RunnerUID de quien recibe (recibe 100 puntos)
   */
  async darZona(runnerUIDA: string, runnerUID: string) {
    const fechaZona = new Date();

    return await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar al que otorga (RunnerUIDA) - suma 50 puntos
      const otorgaUser = await tx.sec_users.findFirst({
        where: { RunnerUID: runnerUIDA },
        select: {
          login: true,
          Z2TotalHistorico: true,
          Z2Recibidas30d: true,
          WalletPuntos: true,
        },
      });

      if (!otorgaUser) {
        throw new NotFoundException(`Usuario con RunnerUID '${runnerUIDA}' no encontrado`);
      }

      const z2TotalOtorga = Number(otorgaUser.Z2TotalHistorico) + 50;
      const z2Recibidas30dOtorga = otorgaUser.Z2Recibidas30d + 50;
      const walletPuntosOtorga = (otorgaUser.WalletPuntos || 0) + 50;

      await tx.sec_users.update({
        where: { login: otorgaUser.login },
        data: {
          FechaUltimaZ2: fechaZona,
          Z2TotalHistorico: BigInt(z2TotalOtorga),
          Z2Recibidas30d: z2Recibidas30dOtorga,
          WalletPuntos: walletPuntosOtorga,
        },
      });

      // 2. Actualizar al que recibe (RunnerUID) - suma 100 puntos
      const recibeUser = await tx.sec_users.findFirst({
        where: { RunnerUID: runnerUID },
        select: {
          login: true,
          Z2TotalHistorico: true,
          Z2Recibidas30d: true,
          WalletPuntos: true,
        },
      });

      if (!recibeUser) {
        throw new NotFoundException(`Usuario con RunnerUID '${runnerUID}' no encontrado`);
      }

      const z2TotalRecibe = Number(recibeUser.Z2TotalHistorico) + 100;
      const z2Recibidas30dRecibe = recibeUser.Z2Recibidas30d + 100;
      const walletPuntosRecibe = (recibeUser.WalletPuntos || 0) + 100;

      await tx.sec_users.update({
        where: { login: recibeUser.login },
        data: {
          FechaUltimaZ2: fechaZona,
          Z2TotalHistorico: BigInt(z2TotalRecibe),
          Z2Recibidas30d: z2Recibidas30dRecibe,
          WalletPuntos: walletPuntosRecibe,
        },
      });

      // 3. Crear zona para quien otorga (motivo 'D' = Da, 50 puntos)
      await tx.zonas.create({
        data: {
          RunnerUID: runnerUIDA,
          RunnerUIDRef: runnerUID,
          puntos: 50,
          motivo: 'D', // Da
          origen: '0', // 0 = GPS
          fecha: fechaZona,
        },
      });

      // 4. Crear zona para quien recibe (motivo 'R' = Recibe, 100 puntos)
      await tx.zonas.create({
        data: {
          RunnerUID: runnerUID,
          RunnerUIDRef: runnerUIDA,
          puntos: 100,
          motivo: 'R', // Recibe
          origen: '0', // 0 = GPS
          fecha: fechaZona,
        },
      });

      return {
        message: 'Zonas otorgadas exitosamente',
        otorga: { RunnerUID: runnerUIDA, puntos: 50 },
        recibe: { RunnerUID: runnerUID, puntos: 100 },
      };
    });
  }

  async remove(login: string) {
    await this.findOne(login); // Verificar que el usuario existe

    return this.prisma.sec_users.delete({
      where: { login: login },
    });
  }
}
