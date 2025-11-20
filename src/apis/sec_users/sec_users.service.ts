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
    // Verificar si el email ya existe
    const existingUserByEmail = await this.prisma.sec_users.findFirst({
      where: { email: createSecUserDto.email },
    });

    // Si el correo ya existe, devolver warning
    if (existingUserByEmail) {
      return {
        message: 'Correo existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el teléfono ya existe
    const existingUserByPhone = await this.prisma.sec_users.findFirst({
      where: { phone: createSecUserDto.phone },
    });

    // Si el teléfono ya existe, devolver warning
    if (existingUserByPhone) {
      return {
        message: 'Numero existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el login ya existe
    const existingUserByLogin = await this.prisma.sec_users.findUnique({
      where: { login: createSecUserDto.login },
    });

    if (existingUserByLogin) {
      return {
        message: `El usuario con login '${createSecUserDto.login}' ya existe`,
        status: 'warning',
        user: undefined,
      };
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
    
    // Valores iniciales
    const puntosIniciales = 10000;
    const suscripcionInicial = 299.00;
    
    try {
      // Crear usuario en una transacción
      const user = await this.prisma.$transaction(async (tx) => {
        // Preparar datos del usuario
        const userData: Prisma.sec_usersCreateInput = {
          RunnerUID: runnerUID,
          AliasRunner: aliasRunner,
          name: createSecUserDto.name,
          login: createSecUserDto.login,
          phone: createSecUserDto.phone,
          email: createSecUserDto.email,
          pswd: password,
          RFC: createSecUserDto.RFC,
          Ciudad: createSecUserDto.Ciudad,
          Estado: createSecUserDto.Estado,
          Pais: createSecUserDto.Pais,
          TipoMembresia: createSecUserDto.TipoMembresia,
          DisciplinaPrincipal: createSecUserDto.DisciplinaPrincipal,
          FechaRenovacionMembresia: fechaRenovacionMembresia,
          fechaNacimiento: createSecUserDto.fechaNacimiento 
            ? new Date(createSecUserDto.fechaNacimiento) 
            : null,
          Genero: createSecUserDto.Genero,
          Peso: createSecUserDto.Peso,
          Estatura: createSecUserDto.Estatura,
          EmergenciaContacto: createSecUserDto.EmergenciaContacto,
          EmergenciaCelular: createSecUserDto.EmergenciaCelular,
          EmergenciaParentesco: createSecUserDto.EmergenciaParentesco,
          equipoID: createSecUserDto.equipoID,
          RunnerUIDRef: createSecUserDto.RunnerUIDRef,
          active: createSecUserDto.active,
          activation_code: createSecUserDto.activation_code,
          priv_admin: createSecUserDto.priv_admin,
          mfa: createSecUserDto.mfa,
          role: createSecUserDto.role,
          // Campos de zonas - no inicializar con puntos
          Z2TotalHistorico: createSecUserDto.Z2TotalHistorico
            ? BigInt(createSecUserDto.Z2TotalHistorico)
            : null,
          Z2Recibidas30d: createSecUserDto.Z2Recibidas30d ?? null,
          WalletPuntos: createSecUserDto.WalletPuntos,
          WalletPuntosI: createSecUserDto.WalletPuntosI ?? puntosIniciales,
          WalletSaldoMXN: createSecUserDto.WalletSaldoMXN,
          GananciasAcumuladasMXN: createSecUserDto.GananciasAcumuladasMXN,
          InvitacionesTotales: createSecUserDto.InvitacionesTotales,
          InvitacionesMensuales: createSecUserDto.InvitacionesMensuales,
          SuscripcionMXN: createSecUserDto.SuscripcionMXN ?? suscripcionInicial,
          PorcentajeCumplimiento: createSecUserDto.PorcentajeCumplimiento,
          NivelRunner: createSecUserDto.NivelRunner,
          CFDIEmitido: createSecUserDto.CFDIEmitido,
          StravaAthleteID: createSecUserDto.StravaAthleteID
            ? BigInt(createSecUserDto.StravaAthleteID)
            : null,
          GarminUserID: createSecUserDto.GarminUserID,
          Z2Otorgadas30d: createSecUserDto.Z2Otorgadas30d,
          Actividades30d: createSecUserDto.Actividades30d,
          NivelMensual: createSecUserDto.NivelMensual,
          FechaUltimaActividad: createSecUserDto.FechaUltimaActividad
            ? new Date(createSecUserDto.FechaUltimaActividad)
            : null,
        };

        // Crear usuario
        const newUser = await tx.sec_users.create({
          data: userData,
        });

        return newUser;
      });

      return {
        message: 'Usuario creado exitosamente',
        status: 'success',
        user: user,
      };
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
    const existingUser = await this.findOne(login); // Verificar que el usuario existe

    // Verificar si se está actualizando el email y si ya existe
    if (updateSecUserDto.email && updateSecUserDto.email !== existingUser.email) {
      const existingUserByEmail = await this.prisma.sec_users.findFirst({
        where: { email: updateSecUserDto.email },
      });

      if (existingUserByEmail && existingUserByEmail.login !== login) {
        throw new ConflictException(
          `El correo '${updateSecUserDto.email}' ya está registrado`,
        );
      }
    }

    // Extraer campos que necesitan conversión especial
    const {
      StravaAthleteID,
      Z2TotalHistorico,
      FechaUltimaActividad,
      FechaRenovacionMembresia,
      FechaUltimaZ2,
      fechaNacimiento,
      ...restFields
    } = updateSecUserDto;

    // Construir el objeto de actualización excluyendo campos problemáticos
    const updateData: Prisma.sec_usersUpdateInput = {
      ...restFields,
    };

    // Convertir campos BigInt de string a BigInt si están presentes
    if (StravaAthleteID !== undefined) {
      updateData.StravaAthleteID = StravaAthleteID
        ? BigInt(StravaAthleteID)
        : null;
    }

    if (Z2TotalHistorico !== undefined) {
      updateData.Z2TotalHistorico = Z2TotalHistorico
        ? BigInt(Z2TotalHistorico)
        : BigInt(0);
    }

    // Convertir fechas de string a Date si están presentes
    if (FechaUltimaActividad) {
      updateData.FechaUltimaActividad = new Date(FechaUltimaActividad);
    }

    if (FechaRenovacionMembresia) {
      updateData.FechaRenovacionMembresia = new Date(FechaRenovacionMembresia);
    }

    if (FechaUltimaZ2) {
      updateData.FechaUltimaZ2 = new Date(FechaUltimaZ2);
    }

    if (fechaNacimiento) {
      updateData.fechaNacimiento = new Date(fechaNacimiento);
    }

    return this.prisma.sec_users.update({
      where: { login: login },
      data: updateData,
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
      const z2Recibidas30dOtorga = (otorgaUser.Z2Recibidas30d || 0) + 50;
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
      const z2Recibidas30dRecibe = (recibeUser.Z2Recibidas30d || 0) + 100;
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
