import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../common/services/sms.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { createHash } from 'crypto';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class SecUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

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
   * Genera RunnerUIDRef con formato: RR + 3 números (0-9) + 3 letras (A-Z)
   * Ejemplo: RR707068TDN
   */
  private generateRunnerUIDRef(): string {
    // Genera 3 números aleatorios entre 0 y 9
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const num3 = Math.floor(Math.random() * 10);
    
    // Genera 3 letras aleatorias (A-Z)
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    
    return `RR${num1}${num2}${num3}${char1}${char2}${char3}`;
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

  /**
   * Pre-registro: crea un usuario y genera automáticamente RunnerUIDRef
   * RunnerUIDRef siempre se genera automáticamente, se ignora cualquier valor enviado
   */
  async preRegister(createSecUserDto: CreateSecUserDto) {
    // Siempre generar RunnerUIDRef automáticamente (ignorar cualquier valor enviado)
    const generatedRunnerUIDRef = this.generateRunnerUIDRef();
    createSecUserDto.RunnerUIDRef = generatedRunnerUIDRef;

    // Establecer TipoMembresia como "E" por defecto si no se proporciona
    if (!createSecUserDto.TipoMembresia) {
      createSecUserDto.TipoMembresia = 'E';
    }

    console.log('=== DEBUG preRegister ===');
    console.log('RunnerUIDRef generado:', generatedRunnerUIDRef);
    console.log('TipoMembresia:', createSecUserDto.TipoMembresia);
    console.log('========================');

    // Llamar al método create normal
    return this.create(createSecUserDto);
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
    const suscripcionInicial = 399.00;
    
    // RunnerUIDRef siempre es un código generado automáticamente (formato "RR...")
    // No se valida como usuario real, es solo un código único de referencia
    let referidor: {
      login: string;
      RunnerUID: string;
      InvitacionesTotales: number | null;
      InvitacionesMensuales: number | null;
    } | null = null;
    
    // Si RunnerUIDRef no empieza con "RR", podría ser un RunnerUID real (para compatibilidad con endpoint create)
    if (createSecUserDto.RunnerUIDRef && !createSecUserDto.RunnerUIDRef.startsWith('RR')) {
      // Es un RunnerUID real, validar que exista
      const referidorFound = await this.prisma.sec_users.findFirst({
        where: { RunnerUID: createSecUserDto.RunnerUIDRef },
        select: {
          login: true,
          RunnerUID: true,
          InvitacionesTotales: true,
          InvitacionesMensuales: true,
        },
      });

      if (!referidorFound) {
        return {
          message: `El RunnerUID de referencia '${createSecUserDto.RunnerUIDRef}' no existe`,
          status: 'error',
          user: undefined,
        };
      }
      
      referidor = referidorFound;
    }
    // Si empieza con "RR", es un código generado, no buscar referidor real
    
    try {
      // Crear usuario en una transacción
      const user = await this.prisma.$transaction(async (tx) => {
        console.log('=== DEBUG create ===');
        console.log('RunnerUIDRef recibido:', createSecUserDto.RunnerUIDRef);
        console.log('TipoMembresia recibido:', createSecUserDto.TipoMembresia);
        console.log('====================');
        
        // Asegurar que RunnerUIDRef y TipoMembresia tengan valores
        const finalRunnerUIDRef = createSecUserDto.RunnerUIDRef || null;
        const finalTipoMembresia = createSecUserDto.TipoMembresia || 'E';
        
        console.log('=== DEBUG valores finales ===');
        console.log('finalRunnerUIDRef:', finalRunnerUIDRef);
        console.log('finalTipoMembresia:', finalTipoMembresia);
        console.log('=============================');
        
        // Preparar datos del usuario
        const userData = {
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
          TipoMembresia: finalTipoMembresia,
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
          RunnerUIDRef: finalRunnerUIDRef,
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
          // No permitir que el frontend envíe estos valores, se calculan automáticamente
          InvitacionesTotales: null,
          InvitacionesMensuales: null,
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

        // Si hay referidor, actualizar sus contadores de invitaciones
        if (referidor) {
          const invitacionesTotales = (referidor.InvitacionesTotales || 0) + 1;
          const invitacionesMensuales = (referidor.InvitacionesMensuales || 0) + 1;

          await tx.sec_users.update({
            where: { login: referidor.login },
            data: {
              InvitacionesTotales: invitacionesTotales,
              InvitacionesMensuales: invitacionesMensuales,
            },
          });
        }

        return newUser;
      });

      return {
        message: 'Usuario creado exitosamente',
        status: 'success',
        user: user,
      };
    } catch (error) {
      // Manejar errores de Prisma (como violación de restricción única)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const field = (error as any).meta?.target as string[] | undefined;
        throw new ConflictException(
          `Ya existe un usuario con ${field?.join(', ') || 'estos datos'}`,
        );
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
    const updateData: any = {
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

  /**
   * Obtiene la información del usuario autenticado
   */
  async me(login: string) {
    const user = await this.findOne(login);
    
    // Retornar usuario sin la contraseña
    const { pswd, ...userWithoutPassword } = user;
    
    return {
      message: 'Usuario obtenido exitosamente',
      status: 'success',
      user: userWithoutPassword,
    };
  }

  /**
   * Genera un código de recuperación de contraseña
   */
  private generateRecoveryCode(): string {
    // Genera un código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Verifica si el número existe y envía código de recuperación por SMS
   * Retorna true si el número existe y el código fue enviado
   * Busca por login o phone (ya que login puede ser el número telefónico)
   */
  async forgetPassword(identifier: string) {
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
        exists: false,
      };
    }

    // Generar código de recuperación
    const recoveryCode = this.generateRecoveryCode();

    // Guardar el código en activation_code
    await this.prisma.sec_users.update({
      where: { login: user.login },
      data: {
        activation_code: recoveryCode,
      },
    });

    // Enviar código por SMS
    console.log('=== DEBUG forgetPassword ===');
    console.log('Usuario encontrado:', user.login);
    console.log('Código generado:', recoveryCode);
    console.log('Enviando SMS a:', user.phone);
    
    const smsSent = await this.smsService.sendRecoveryCode(user.phone, recoveryCode);

    if (!smsSent) {
      console.error('❌ No se pudo enviar el SMS');
      return {
        message: 'Error al enviar código por SMS',
        status: 'error',
        exists: true,
      };
    }

    console.log('✅ SMS enviado correctamente');
    console.log('===========================');

    return {
      message: 'Código de recuperación enviado a tu teléfono',
      status: 'success',
      exists: true,
    };
  }

  /**
   * Verifica el código de recuperación ingresado por el usuario
   */
  async verifyRecoveryCode(phone: string, code: string) {
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
        verified: false,
      };
    }

    // Verificar si el código coincide
    if (!user.activation_code || user.activation_code !== code) {
      return {
        message: 'Código de recuperación incorrecto',
        status: 'error',
        verified: false,
      };
    }

    // Código verificado correctamente
    return {
      message: 'Código verificado correctamente',
      status: 'success',
      verified: true,
      login: user.login, // Retornar el login para el siguiente paso (cambiar contraseña)
    };
  }

  /**
   * Cambia la contraseña del usuario después de verificar el código de recuperación
   * Busca por login o phone (ya que login puede ser el número telefónico)
   */
  async changePassword(identifier: string, code: string, newPassword: string) {
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
        changed: false,
      };
    }

    // Verificar si el código coincide
    if (!user.activation_code || user.activation_code !== code) {
      return {
        message: 'Código de recuperación incorrecto',
        status: 'error',
        changed: false,
      };
    }

    // Hashear la nueva contraseña con SHA1
    const hashedPassword = createHash('sha1').update(newPassword).digest('hex');

    // Actualizar la contraseña y limpiar el código de activación
    await this.prisma.sec_users.update({
      where: { login: user.login },
      data: {
        pswd: hashedPassword,
        activation_code: null, // Limpiar el código después de usarlo
        pswd_last_updated: new Date(),
      },
    });

    return {
      message: 'Contraseña cambiada exitosamente',
      status: 'success',
      changed: true,
    };
  }
}
