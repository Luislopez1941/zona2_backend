import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../common/services/sms.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateSecUserDto } from './dto/create-sec_user.dto';
import { UpdateSecUserDto } from './dto/update-sec_user.dto';
import { CreateOrganizadorDto } from './dto/create-organizador.dto';
import { UpdatePeacerDto } from './dto/update-peacer.dto';
import { createHash, randomUUID } from 'crypto';
import { PrismaClient, Prisma, organizadores_Estatus, establecimientos_Estatus } from '@prisma/client';

@Injectable()
export class SecUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    @Inject(forwardRef(() => NotificacionesService))
    private readonly notificacionesService: NotificacionesService,
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
   * Genera SubscriptionUID con formato: # + 6 números (0-9) + 3 letras (A-Z)
   * Ejemplo: #907481YEX
   */
  private generateSubscriptionUID(): string {
    // Genera 6 números aleatorios entre 0 y 9
    const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    
    // Genera 3 letras aleatorias (A-Z)
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    
    return `#${nums}${char1}${char2}${char3}`;
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
   * Pre-registro: crea un usuario
   * Si viene RunnerUIDRef, se usa ese y se asignan 500 puntos en WalletPuntos a ambos usuarios
   * Solo asigna 10000 puntos en WalletPuntosI, TipoMembresia = 'R', sin puntos en Z2
   */
  async preRegister(createSecUserDto: CreateSecUserDto) {
    // Verificar si el email ya existe
    const existingUserByEmail = await this.prisma.sec_users.findFirst({
      where: { email: createSecUserDto.email },
    });

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

    // Si viene RunnerUIDRef, buscar el usuario referidor
    let referidor: { login: string; WalletPuntos: number | null } | null = null;
    let finalRunnerUIDRef: string | null = null;
    
    if (createSecUserDto.RunnerUIDRef) {
      // Buscar el usuario referidor por RunnerUID
      const referidorFound = await this.prisma.sec_users.findFirst({
        where: { RunnerUID: createSecUserDto.RunnerUIDRef },
        select: {
          login: true,
          WalletPuntos: true,
        },
      });

      if (referidorFound) {
        referidor = referidorFound;
        finalRunnerUIDRef = createSecUserDto.RunnerUIDRef;
      } else {
        // Si no se encuentra, generar uno automático
        finalRunnerUIDRef = this.generateRunnerUIDRef();
      }
    } else {
      // Si no viene RunnerUIDRef, generar uno automático
      finalRunnerUIDRef = this.generateRunnerUIDRef();
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
    
    // Valores para pre-registro
    const puntosIniciales = 10000;
    const puntosNuevoUsuario = 1000; // Puntos para el nuevo usuario que se registra
    const puntosReferidor = 500; // Puntos para el referidor
    const suscripcionInicial = 399.00;
    
    try {
      // Crear usuario en una transacción
      const user = await this.prisma.$transaction(async (tx) => {
        // Preparar datos del usuario para pre-registro
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
          TipoMembresia: 'R', // Siempre 'R' para pre-registro
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
          active: createSecUserDto.active ?? 'Y',
          activation_code: createSecUserDto.activation_code,
          priv_admin: createSecUserDto.priv_admin,
          mfa: createSecUserDto.mfa,
          role: createSecUserDto.role,
          // NO agregar puntos en Z2 para pre-registro
          Z2TotalHistorico: null,
          Z2Recibidas30d: null,
          // WalletPuntosI con 10000 puntos, WalletPuntos con 1000 si hay referidor
          WalletPuntos: referidor ? puntosNuevoUsuario : null,
          WalletPuntosI: puntosIniciales,
          WalletSaldoMXN: createSecUserDto.WalletSaldoMXN ?? 0.00,
          GananciasAcumuladasMXN: createSecUserDto.GananciasAcumuladasMXN ?? 0.00,
          InvitacionesTotales: null,
          InvitacionesMensuales: null,
          SuscripcionMXN: createSecUserDto.SuscripcionMXN ?? suscripcionInicial,
          PorcentajeCumplimiento: createSecUserDto.PorcentajeCumplimiento ?? 0.00,
          NivelRunner: createSecUserDto.NivelRunner ?? 'B',
          CFDIEmitido: createSecUserDto.CFDIEmitido ?? false,
          StravaAthleteID: createSecUserDto.StravaAthleteID
            ? BigInt(createSecUserDto.StravaAthleteID)
            : null,
          GarminUserID: createSecUserDto.GarminUserID,
          Z2Otorgadas30d: null,
          Actividades30d: null,
          NivelMensual: createSecUserDto.NivelMensual,
          FechaUltimaActividad: createSecUserDto.FechaUltimaActividad
            ? new Date(createSecUserDto.FechaUltimaActividad)
            : null,
        };

        // Crear usuario
        const newUser = await tx.sec_users.create({
          data: userData,
        });

        // Si hay referidor, asignar 500 puntos en WalletPuntos al referidor
        if (referidor && finalRunnerUIDRef) {
          const nuevosPuntosReferidor = (referidor.WalletPuntos || 0) + puntosReferidor;
          
          await tx.sec_users.update({
            where: { login: referidor.login },
            data: {
              WalletPuntos: nuevosPuntosReferidor,
            },
          });

          // Crear registro en zonas para el referidor
          await tx.zonas.create({
            data: {
              RunnerUID: finalRunnerUIDRef, // El referidor recibe los puntos
              RunnerUIDRef: runnerUID, // El nuevo usuario es la referencia
              puntos: puntosReferidor, // 500 puntos por referido
              motivo: 'R',
              origen: '3',
              fecha: new Date(),
            },
          });
        }

        // Crear registro en zonas para el nuevo usuario
        await tx.zonas.create({
          data: {
            RunnerUID: runnerUID,
            RunnerUIDRef: '', // Cadena vacía ya que la BD no permite null
            puntos: puntosIniciales,
            motivo: 'R',
            origen: '3',
            fecha: new Date(),
          },
        });

        // Crear suscripción para el nuevo usuario
        const subscriptionUID = this.generateSubscriptionUID();
        await tx.subscriptions.create({
          data: {
            SubscriptionUID: subscriptionUID,
            RunnerUID: runnerUID,
            PlanCode: 'Runner',
            PlanVersion: 1,
            BillingCycle: 'Yearly',
            Status: 'Pending',
            StartAt: new Date(),
            EndAt: null, // NULL para pre-registro con Status Pending
            NextChargeAt: null, // NULL para pre-registro con Status Pending
            Currency: 'MXN',
            PriceMXN: suscripcionInicial,
            AutoRenew: true,
            // Los demás campos opcionales se dejan como null (defaults de Prisma)
          },
        });

        return newUser;
      });

      // Crear notificación para el referidor si existe
      if (referidor && finalRunnerUIDRef) {
        try {
          await this.notificacionesService.create({
            toRunnerUID: finalRunnerUIDRef, // El referidor recibe la notificación
            fromRunnerUID: runnerUID, // El nuevo usuario es quien envía
            tipo: 'nuevo_referido',
            mensaje: `Un nuevo usuario se registró con tu código de referido y recibiste ${puntosReferidor} puntos`,
          });
        } catch (error) {
          // Si falla la notificación, no afecta el registro del usuario
          console.error('Error al crear notificación para referidor:', error);
        }
      }

      return {
        message: 'Registro exitoso',
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

  /**
   * Obtiene todos los usuarios activos sin contraseñas
   */
  async getAll() {
    const users = await this.prisma.sec_users.findMany({
      where: {
        active: 'Y',
      },
      orderBy: {
        FechaRegistro: 'desc',
      },
      select: {
        RunnerUID: true,
        AliasRunner: true,
        name: true,
        login: true,
        phone: true,
        email: true,
        TipoMembresia: true,
        Ciudad: true,
        Estado: true,
        Pais: true,
        NivelRunner: true,
        WalletPuntos: true,
        WalletPuntosI: true,
        FechaRegistro: true,
        picture: true,
      },
    });

    return {
      message: 'Usuarios obtenidos exitosamente',
      status: 'success',
      total: users.length,
      users,
    };
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

  /**
   * Obtiene un usuario por su RunnerUID
   */
  async getById(runnerUID: string) {
    const user = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con RunnerUID '${runnerUID}' no encontrado`);
    }

    // Retornar usuario sin la contraseña
    const { pswd, ...userWithoutPassword } = user;

    return {
      message: 'Usuario obtenido exitosamente',
      status: 'success',
      user: userWithoutPassword,
    };
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
   * Actualiza un usuario por RunnerUID
   */
  async updateByRunnerUID(runnerUID: string, updateSecUserDto: UpdateSecUserDto) {
    // Buscar el usuario por RunnerUID
    const existingUser = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuario con RunnerUID '${runnerUID}' no encontrado`);
    }

    // Verificar si se está actualizando el email y si ya existe
    if (updateSecUserDto.email && updateSecUserDto.email !== existingUser.email) {
      const existingUserByEmail = await this.prisma.sec_users.findFirst({
        where: { email: updateSecUserDto.email },
      });

      if (existingUserByEmail && existingUserByEmail.login !== existingUser.login) {
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

    // Construir el objeto de actualización
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

    const updatedUser = await this.prisma.sec_users.update({
      where: { login: existingUser.login },
      data: updateData,
    });

    return {
      message: 'Usuario actualizado exitosamente',
      status: 'success',
      user: updatedUser,
    };
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
    
    // Si el usuario es un pacer (TipoMembresia === 'P'), obtener información de la tabla pacers
    let pacerInfo: any = null;
    if (userWithoutPassword.TipoMembresia === 'P' && userWithoutPassword.RunnerUID) {
      const pacer = await this.prisma.pacers.findFirst({
        where: {
          RunnerUID: userWithoutPassword.RunnerUID,
        },
      });
      
      if (pacer) {
        pacerInfo = pacer;
      }
    }
    
    return {
      message: 'Usuario obtenido exitosamente',
      status: 'success',
      user: userWithoutPassword,
      pacer: pacerInfo, // Información del pacer si TipoMembresia es 'P'
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

  /**
   * Crea un registro completo de organizador:
   * 1. Crea usuario en sec_users
   * 2. Crea registro en zonas (1000 puntos)
   * 3. Crea suscripción
   * 4. Crea registro en organizadores
   */
  async createOrganizador(createOrganizadorDto: CreateOrganizadorDto) {
    // Verificar si el email ya existe
    const existingUserByEmail = await this.prisma.sec_users.findFirst({
      where: { email: createOrganizadorDto.correoElectronico },
    });

    if (existingUserByEmail) {
      return {
        message: 'Correo existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el teléfono ya existe
    const existingUserByPhone = await this.prisma.sec_users.findFirst({
      where: { phone: createOrganizadorDto.celular },
    });

    if (existingUserByPhone) {
      return {
        message: 'Numero existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el login (phone) ya existe
    const existingUserByLogin = await this.prisma.sec_users.findUnique({
      where: { login: createOrganizadorDto.celular },
    });

    if (existingUserByLogin) {
      return {
        message: `El usuario con login '${createOrganizadorDto.celular}' ya existe`,
        status: 'warning',
        user: undefined,
      };
    }

    // Generar RunnerUID con formato Z2R...
    const runnerUID = this.generateRunnerUID();
    
    // Generar AliasRunner con formato R...
    const aliasRunner = this.generateAliasRunner();
    
    // Generar contraseña por defecto (hasheada con SHA1)
    const password = this.generateDefaultPassword();
    
    // Calcular fechas
    const now = new Date();
    const fechaRenovacionMembresia = new Date(now);
    fechaRenovacionMembresia.setFullYear(fechaRenovacionMembresia.getFullYear() + 1);
    
    // Valores para organizador
    const puntosIniciales = 10000;
    const suscripcionInicial = 399.00;
    
    try {
      // Crear todos los registros en una transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Usar nombreCompleto si viene, sino usar nombreComercial como fallback
        const nombreCompleto = createOrganizadorDto.nombreCompleto || createOrganizadorDto.nombreComercial;
        
        // 1. Crear usuario en sec_users
        const newUser = await tx.sec_users.create({
          data: {
            RunnerUID: runnerUID,
            AliasRunner: aliasRunner,
            name: nombreCompleto,
            login: createOrganizadorDto.celular, // login = celular
            phone: createOrganizadorDto.celular,
            email: createOrganizadorDto.correoElectronico,
            pswd: password,
            TipoMembresia: 'O', // Organizador
            active: 'Y',
            WalletPuntosI: puntosIniciales,
            WalletPuntos: null, // Solo WalletPuntosI
            SuscripcionMXN: suscripcionInicial,
            FechaRenovacionMembresia: fechaRenovacionMembresia,
            Z2TotalHistorico: null, // No registrar en Z2
            Z2Recibidas30d: null, // No registrar en Z2
            Ciudad: 'Mérida',
            Estado: 'Yucatán',
            Pais: 'México',
          },
        });

        // 2. Crear suscripción
        const subscriptionUID = randomUUID();
        await tx.subscriptions.create({
          data: {
            SubscriptionUID: subscriptionUID,
            RunnerUID: runnerUID,
            PlanCode: 'Organizador',
            PlanVersion: 1,
            BillingCycle: 'Yearly',
            Status: 'Pending',
            StartAt: now,
          },
        });

        // 3. Crear registro en organizadores
        const newOrganizador = await tx.organizadores.create({
          data: {
            RunnerUID: runnerUID,
            NombreComercial: createOrganizadorDto.nombreComercial,
            RazonSocial: createOrganizadorDto.razonSocial || null,
            ContactoNombre: nombreCompleto,
            ContactoEmail: createOrganizadorDto.correoElectronico,
            ContactoTelefono: createOrganizadorDto.celular,
            Ciudad: 'Mérida',
            Estado: 'Yucatán',
            Pais: 'México',
            Estatus: organizadores_Estatus.pendiente,
          },
        });

        return {
          user: newUser,
          organizador: newOrganizador,
          subscriptionUID: subscriptionUID,
        };
      });

      return {
        message: 'Organizador creado exitosamente',
        status: 'success',
        user: result.user,
        organizador: result.organizador,
      };
    } catch (error) {
      // Manejar errores de Prisma
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const field = (error as any).meta?.target as string[] | undefined;
        throw new ConflictException(
          `Ya existe un registro con ${field?.join(', ') || 'estos datos'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Crea un registro completo de establecimiento:
   * 1. Crea usuario en sec_users
   * 2. Crea registro en zonas (1000 puntos)
   * 3. Crea suscripción
   * 4. Crea registro en establecimientos
   */
  async createEstablecimiento(createOrganizadorDto: CreateOrganizadorDto) {
    // Verificar si el email ya existe
    const existingUserByEmail = await this.prisma.sec_users.findFirst({
      where: { email: createOrganizadorDto.correoElectronico },
    });

    if (existingUserByEmail) {
      return {
        message: 'Correo existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el teléfono ya existe
    const existingUserByPhone = await this.prisma.sec_users.findFirst({
      where: { phone: createOrganizadorDto.celular },
    });

    if (existingUserByPhone) {
      return {
        message: 'Numero existente',
        status: 'warning',
        user: undefined,
      };
    }

    // Verificar si el login (phone) ya existe
    const existingUserByLogin = await this.prisma.sec_users.findUnique({
      where: { login: createOrganizadorDto.celular },
    });

    if (existingUserByLogin) {
      return {
        message: `El usuario con login '${createOrganizadorDto.celular}' ya existe`,
        status: 'warning',
        user: undefined,
      };
    }

    // Generar RunnerUID con formato Z2R...
    const runnerUID = this.generateRunnerUID();
    
    // Generar AliasRunner con formato R...
    const aliasRunner = this.generateAliasRunner();
    
    // Generar contraseña por defecto (hasheada con SHA1)
    const password = this.generateDefaultPassword();
    
    // Calcular fechas
    const now = new Date();
    const fechaRenovacionMembresia = new Date(now);
    fechaRenovacionMembresia.setFullYear(fechaRenovacionMembresia.getFullYear() + 1);
    
    // Valores para establecimiento
    const puntosIniciales = 10000;
    const suscripcionInicial = 399.00;
    
    try {
      // Crear todos los registros en una transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Usar nombreCompleto si viene, sino usar nombreComercial como fallback
        const nombreCompleto = createOrganizadorDto.nombreCompleto || createOrganizadorDto.nombreComercial;
        
        // 1. Crear usuario en sec_users
        const newUser = await tx.sec_users.create({
          data: {
            RunnerUID: runnerUID,
            AliasRunner: aliasRunner,
            name: nombreCompleto,
            login: createOrganizadorDto.celular, // login = celular
            phone: createOrganizadorDto.celular,
            email: createOrganizadorDto.correoElectronico,
            pswd: password,
            TipoMembresia: 'S', // Establecimiento
            active: 'Y',
            WalletPuntosI: puntosIniciales,
            WalletPuntos: null, // Solo WalletPuntosI
            SuscripcionMXN: suscripcionInicial,
            FechaRenovacionMembresia: fechaRenovacionMembresia,
            Z2TotalHistorico: null, // No registrar en Z2
            Z2Recibidas30d: null, // No registrar en Z2
            Ciudad: 'Mérida',
            Estado: 'Yucatán',
            Pais: 'México',
          },
        });

        // 2. Crear suscripción
        const subscriptionUID = randomUUID();
        await tx.subscriptions.create({
          data: {
            SubscriptionUID: subscriptionUID,
            RunnerUID: runnerUID,
            PlanCode: 'Organizador', // Mismo plan que organizadores
            PlanVersion: 1,
            BillingCycle: 'Yearly',
            Status: 'Pending',
            StartAt: now,
          },
        });

        // 3. Crear registro en establecimientos
        const newEstablecimiento = await tx.establecimientos.create({
          data: {
            NombreComercial: createOrganizadorDto.nombreComercial,
            Descripcion: createOrganizadorDto.razonSocial || null,
            Ciudad: 'Mérida',
            Estado: 'Yucatán',
            Pais: 'México',
            Estatus: establecimientos_Estatus.pendiente,
          },
        });

        return {
          user: newUser,
          establecimiento: newEstablecimiento,
          subscriptionUID: subscriptionUID,
        };
      });

      return {
        message: 'Establecimiento creado exitosamente',
        status: 'success',
        user: result.user,
        establecimiento: result.establecimiento,
      };
    } catch (error) {
      // Manejar errores de Prisma
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const field = (error as any).meta?.target as string[] | undefined;
        throw new ConflictException(
          `Ya existe un registro con ${field?.join(', ') || 'estos datos'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza un usuario Runner a Pacer
   * Cambia TipoMembresia de 'R' a 'P' y actualiza la suscripción
   */
  async updatePeacer(updatePeacerDto: UpdatePeacerDto) {
    const { RunnerUID, FechaRenovacionMembresia } = updatePeacerDto;

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar que el usuario es Runner (TipoMembresia = 'R')
    if (usuario.TipoMembresia !== 'R') {
      throw new ConflictException(
        `El usuario con RunnerUID ${RunnerUID} no es un Runner. TipoMembresia actual: ${usuario.TipoMembresia}`,
      );
    }

    // Calcular FechaRenovacionMembresia (1 año desde ahora o la fecha proporcionada)
    const fechaRenovacion = FechaRenovacionMembresia
      ? new Date(FechaRenovacionMembresia)
      : new Date();
    
    if (!FechaRenovacionMembresia) {
      fechaRenovacion.setFullYear(fechaRenovacion.getFullYear() + 1);
    }

    try {
      // Actualizar usuario y suscripción en una transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar el usuario a Pacer
        const updatedUser = await tx.sec_users.update({
          where: { login: usuario.login },
          data: {
            TipoMembresia: 'P', // Cambiar a Pacer
            FechaRenovacionMembresia: fechaRenovacion,
          },
        });

        // 2. Buscar y actualizar la suscripción existente
        const existingSubscription = await tx.subscriptions.findFirst({
          where: { RunnerUID },
          orderBy: [
            { RunnerUID: 'asc' },
            { UpdatedAt: 'desc' },
          ],
        });

        let subscriptionUID = existingSubscription?.SubscriptionUID;

        if (existingSubscription) {
          // Actualizar suscripción existente
          await tx.subscriptions.update({
            where: { SubscriptionUID: existingSubscription.SubscriptionUID },
            data: {
              PlanCode: 'Pacer',
              Status: 'Active',
              StartAt: new Date(),
            },
          });
        } else {
          // Crear nueva suscripción si no existe
          subscriptionUID = randomUUID();
          await tx.subscriptions.create({
            data: {
              SubscriptionUID: subscriptionUID,
              RunnerUID: RunnerUID,
              PlanCode: 'Pacer',
              PlanVersion: 1,
              BillingCycle: 'Yearly',
              Status: 'Active',
              StartAt: new Date(),
            },
          });
        }

        return {
          user: updatedUser,
          subscriptionUID: subscriptionUID,
        };
      });

      return {
        message: 'Usuario actualizado a Pacer exitosamente',
        status: 'success',
        user: result.user,
        subscriptionUID: result.subscriptionUID,
      };
    } catch (error) {
      // Manejar errores de Prisma
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        const field = (error as any).meta?.target as string[] | undefined;
        throw new ConflictException(
          `Ya existe un registro con ${field?.join(', ') || 'estos datos'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Obtiene la cantidad de referidos que tiene un usuario
   * Cuenta cuántos usuarios tienen ese RunnerUID como su RunnerUIDRef
   */
  async getReferidosCount(runnerUID: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runnerUID} no encontrado`,
      );
    }

    // Contar cuántos usuarios tienen este RunnerUID como su RunnerUIDRef
    const count = await this.prisma.sec_users.count({
      where: {
        RunnerUIDRef: runnerUID,
      },
    });

    return {
      message: 'Cantidad de referidos obtenida exitosamente',
      status: 'success',
      runnerUID,
      totalReferidos: count,
    };
  }

  /**
   * Obtiene las ganancias totales de los referidos de un usuario
   * Suma todos los puntos que ha recibido por referidos en la tabla zonas
   */
  async getGananciasReferidos(runnerUID: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID: runnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con RunnerUID ${runnerUID} no encontrado`,
      );
    }

    // Obtener todos los referidos del usuario
    const referidos = await this.prisma.sec_users.findMany({
      where: {
        RunnerUIDRef: runnerUID,
      },
      select: {
        RunnerUID: true,
      },
    });

    const referidosRunnerUIDs = referidos.map((r) => r.RunnerUID);

    // Si no tiene referidos, retornar 0
    if (referidosRunnerUIDs.length === 0) {
      return {
        message: 'Ganancias de referidos obtenidas exitosamente',
        status: 'success',
        runnerUID,
        totalReferidos: 0,
        gananciasTotales: 0,
        puntosPorReferido: 500,
      };
    }

    // Buscar todos los registros en zonas donde el referidor recibió puntos por estos referidos
    const zonasReferidos = await this.prisma.zonas.findMany({
      where: {
        RunnerUID: runnerUID, // El referidor
        RunnerUIDRef: {
          in: referidosRunnerUIDs, // Que sean sus referidos
        },
        motivo: 'R',
        origen: '3',
      },
      select: {
        puntos: true,
      },
    });

    // Sumar todos los puntos
    const gananciasTotales = zonasReferidos.reduce(
      (sum, zona) => sum + zona.puntos,
      0,
    );

    return {
      message: 'Ganancias de referidos obtenidas exitosamente',
      status: 'success',
      runnerUID,
      totalReferidos: referidos.length,
      gananciasTotales,
      puntosPorReferido: 500,
      detalle: {
        registrosEnZonas: zonasReferidos.length,
        puntosTotales: gananciasTotales,
      },
    };
  }

  /**
   * Búsqueda optimizada y escalable de usuarios por nombre
   * @param query - Término de búsqueda (mínimo 2 caracteres)
   * @param page - Número de página (por defecto 1)
   * @param limit - Límite de resultados por página (por defecto 20, máximo 50)
   * @returns Lista paginada de usuarios que coinciden con la búsqueda
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    // Validar query
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'El término de búsqueda debe tener al menos 2 caracteres',
      );
    }

    // Limitar el máximo de resultados por página
    const maxLimit = 50;
    const limitNumber = limit > maxLimit ? maxLimit : limit;

    // Calcular offset para paginación
    const skip = (page - 1) * limitNumber;

    // Normalizar el query para búsqueda
    const searchTerm = query.trim();

    // OPTIMIZACIÓN: Usar búsqueda eficiente con LIKE
    // MySQL usa índices eficientemente con LIKE cuando el patrón no empieza con %
    const [usuarios, total] = await Promise.all([
      // Búsqueda principal: usuarios cuyo nombre empieza con el término (más relevante)
      this.prisma.sec_users.findMany({
        where: {
          AND: [
            {
              name: {
                startsWith: searchTerm,
              },
            },
            {
              active: 'Y',
            },
          ],
        },
        select: {
          RunnerUID: true,
          name: true,
          AliasRunner: true,
          email: true,
          Ciudad: true,
          Estado: true,
          Pais: true,
          TipoMembresia: true,
          picture: true,
          NivelRunner: true,
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],
        skip,
        take: limitNumber,
      }),
      // Contar total de resultados
      this.prisma.sec_users.count({
        where: {
          AND: [
            {
              name: {
                startsWith: searchTerm,
              },
            },
            {
              active: 'Y',
            },
          ],
        },
      }),
    ]);

    // Si no hay resultados con "starts with", buscar con "contains"
    let resultadosFinales = usuarios;
    let totalFinal = total;

    if (usuarios.length === 0) {
      const [usuariosContains, totalContains] = await Promise.all([
        this.prisma.sec_users.findMany({
          where: {
            AND: [
              {
                name: {
                  contains: searchTerm,
                },
              },
              {
                active: 'Y',
              },
            ],
          },
          select: {
            RunnerUID: true,
            name: true,
            AliasRunner: true,
            email: true,
            Ciudad: true,
            Estado: true,
            Pais: true,
            TipoMembresia: true,
            picture: true,
            NivelRunner: true,
          },
          orderBy: [
            {
              name: 'asc',
            },
          ],
          skip,
          take: limitNumber,
        }),
        this.prisma.sec_users.count({
          where: {
            AND: [
              {
                name: {
                  contains: searchTerm,
                },
              },
              {
                active: 'Y',
              },
            ],
          },
        }),
      ]);
      resultadosFinales = usuariosContains;
      totalFinal = totalContains;
    }

    // Calcular información de paginación
    const totalPages = Math.ceil(totalFinal / limitNumber);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      message: 'Búsqueda de usuarios completada exitosamente',
      status: 'success',
      query: searchTerm,
      pagination: {
        page,
        limit: limitNumber,
        total: totalFinal,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      usuarios: resultadosFinales,
    };
  }

  /**
   * Permite que un usuario se una a un equipo
   * Agrega el OrgID del equipo al array equiposIDs del usuario (JSON)
   * @param joinATeamDto - DTO con RunnerUID y OrgID
   * @returns Información del equipo al que se unió el usuario
   */
  async joinATeam(joinATeamDto: { RunnerUID: string; OrgID: number }) {
    const { RunnerUID, OrgID } = joinATeamDto;

    // Verificar que el usuario existe
    const usuario = await this.prisma.sec_users.findFirst({
      where: { RunnerUID },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con RunnerUID ${RunnerUID} no encontrado`);
    }

    // Verificar que el equipo existe y está activo
    const equipo = await this.prisma.equipos.findUnique({
      where: { OrgID },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${OrgID} no encontrado`);
    }

    if (!equipo.Activo) {
      throw new ConflictException(`El equipo con ID ${OrgID} no está activo`);
    }

    // Obtener el array actual de equiposIDs
    let equiposIDsArray: number[] = [];
    
    if (usuario.equiposIDs) {
      // Prisma devuelve JSON como objeto/array directamente
      if (Array.isArray(usuario.equiposIDs)) {
        equiposIDsArray = [...(usuario.equiposIDs as number[])]; // Crear copia del array
      } else if (typeof usuario.equiposIDs === 'string') {
        // Si es string, parsearlo
        try {
          const parsed = JSON.parse(usuario.equiposIDs);
          equiposIDsArray = Array.isArray(parsed) ? parsed : [];
        } catch {
          equiposIDsArray = [];
        }
      } else {
        // Si es un objeto, intentar convertirlo
        equiposIDsArray = [];
      }
    }

    // Verificar si el usuario ya está en este equipo
    if (equiposIDsArray.includes(OrgID)) {
      return {
        message: 'El usuario ya está en este equipo',
        status: 'success',
        equipo,
        equiposIDs: equiposIDsArray,
      };
    }

    // Agregar el nuevo OrgID al array (evitar duplicados)
    if (!equiposIDsArray.includes(OrgID)) {
      equiposIDsArray.push(OrgID);
    }

    // Actualizar el usuario y el equipo en una transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Actualizar el campo equiposIDs del usuario con el nuevo array
      // Convertir el array a JSON string ya que el campo es String en Prisma
      const usuarioActualizado = await tx.sec_users.update({
        where: { login: usuario.login },
        data: {
          equiposIDs: JSON.stringify(equiposIDsArray),
        },
        select: {
          RunnerUID: true,
          equiposIDs: true,
          name: true,
        },
      });

      // Incrementar AtletasActivos del nuevo equipo
      await tx.equipos.update({
        where: { OrgID },
        data: {
          AtletasActivos: {
            increment: 1,
          },
        },
      });

      return usuarioActualizado;
    });

    // Obtener el equipo actualizado
    const equipoActualizado = await this.prisma.equipos.findUnique({
      where: { OrgID },
    });

    return {
      message: 'Usuario unido al equipo exitosamente',
      status: 'success',
      usuario: {
        RunnerUID: resultado.RunnerUID,
        equiposIDs: resultado.equiposIDs,
        name: resultado.name,
      },
      equipo: equipoActualizado,
    };
  }

  /**
   * Busca pacers en la tabla pacers por NombreCompleto o AliasPacer
   * Solo devuelve pacers activos
   */
  async searchPacers(query: string, page: number = 1, limit: number = 20) {
    // Validar query
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'El término de búsqueda debe tener al menos 2 caracteres',
      );
    }

    // Limitar el máximo de resultados por página
    const maxLimit = 50;
    const limitNumber = limit > maxLimit ? maxLimit : limit;

    // Calcular offset para paginación
    const skip = (page - 1) * limitNumber;

    // Normalizar el query para búsqueda
    const searchTerm = query.trim();

    // OPTIMIZACIÓN: Usar búsqueda eficiente con LIKE
    // Buscar en la tabla pacers por NombreCompleto o AliasPacer
    const [pacers, total] = await Promise.all([
      // Búsqueda principal: pacers cuyo nombre o alias empieza con el término (más relevante)
      this.prisma.pacers.findMany({
        where: {
          AND: [
            {
              PacerActivo: true,
            },
            {
              OR: [
                {
                  NombreCompleto: {
                    startsWith: searchTerm,
                  },
                },
                {
                  AliasPacer: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          ],
        },
        orderBy: [
          {
            NombreCompleto: 'asc',
          },
        ],
        skip,
        take: limitNumber,
      }),
      // Contar total de resultados
      this.prisma.pacers.count({
        where: {
          AND: [
            {
              PacerActivo: true,
            },
            {
              OR: [
                {
                  NombreCompleto: {
                    startsWith: searchTerm,
                  },
                },
                {
                  AliasPacer: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          ],
        },
      }),
    ]);

    // Si no hay resultados con "starts with", buscar con "contains"
    let resultadosFinales = pacers;
    let totalFinal = total;

    if (pacers.length === 0) {
      const [pacersContains, totalContains] = await Promise.all([
        this.prisma.pacers.findMany({
          where: {
            AND: [
              {
                PacerActivo: true,
              },
              {
                OR: [
                  {
                    NombreCompleto: {
                      contains: searchTerm,
                    },
                  },
                  {
                    AliasPacer: {
                      contains: searchTerm,
                    },
                  },
                ],
              },
            ],
          },
          orderBy: [
            {
              NombreCompleto: 'asc',
            },
          ],
          skip,
          take: limitNumber,
        }),
        this.prisma.pacers.count({
          where: {
            AND: [
              {
                PacerActivo: true,
              },
              {
                OR: [
                  {
                    NombreCompleto: {
                      contains: searchTerm,
                    },
                  },
                  {
                    AliasPacer: {
                      contains: searchTerm,
                    },
                  },
                ],
              },
            ],
          },
        }),
      ]);

      resultadosFinales = pacersContains;
      totalFinal = totalContains;
    }

    // Calcular total de páginas
    const totalPages = Math.ceil(totalFinal / limitNumber);

    return {
      message: 'Pacers encontrados exitosamente',
      status: 'success',
      query: searchTerm,
      pagination: {
        page: page,
        limit: limitNumber,
        total: totalFinal,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      pacers: resultadosFinales,
    };
  }
}
