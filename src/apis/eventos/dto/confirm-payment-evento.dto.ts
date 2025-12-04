import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, IsDateString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TallaPlayera {
  ExtraChica = 'ExtraChica',
  Chica = 'Chica',
  Mediana = 'Mediana',
  Grande = 'Grande',
  ExtraGrande = 'ExtraGrande',
}

export class ConfirmPaymentEventoDto {
  @ApiProperty({ 
    description: 'ID del PaymentIntent creado previamente',
    example: 'pi_3SaWER4ZxqSKUeiz0pN3dEcA'
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiProperty({ 
    description: 'ID del PaymentMethod creado con Stripe.js en el frontend',
    example: 'pm_1ABC123...'
  })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  // ========== DATOS DE INSCRIPCIÓN ==========

  @ApiProperty({ description: 'ID del evento' })
  @Type(() => Number)
  @IsNumber()
  EventoID: number;

  @ApiProperty({ description: 'UID del corredor' })
  @IsString()
  @IsNotEmpty()
  RunnerUID: string;

  @ApiProperty({ description: 'Distancia elegida para el evento' })
  @IsString()
  @IsNotEmpty()
  DistanciaElegida: string;

  @ApiPropertyOptional({ description: 'Nombre del corredor' })
  @IsOptional()
  @IsString()
  RunnerNombre?: string;

  @ApiPropertyOptional({ description: 'Email del corredor' })
  @IsOptional()
  @IsEmail()
  RunnerEmail?: string;

  @ApiPropertyOptional({ description: 'Teléfono del corredor' })
  @IsOptional()
  @IsString()
  RunnerTelefono?: string;

  @ApiPropertyOptional({ description: 'Género (M/F)' })
  @IsOptional()
  @IsString()
  Genero?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento' })
  @IsOptional()
  @IsDateString()
  FechaNacimiento?: string;

  @ApiPropertyOptional({ description: 'Talla de playera' })
  @IsOptional()
  @IsEnum(TallaPlayera)
  TallaPlayera?: TallaPlayera;

  @ApiPropertyOptional({ description: 'ID del equipo' })
  @IsOptional()
  @IsString()
  EquipoID?: string;

  @ApiPropertyOptional({ description: 'Categoría elegida' })
  @IsOptional()
  @IsString()
  CategoriaElegida?: string;

  @ApiPropertyOptional({ description: 'Disciplina (default: Carrera)' })
  @IsOptional()
  @IsString()
  Disciplina?: string;

  @ApiPropertyOptional({ description: 'Puntos Z2 usados' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  PuntosUsados?: number;

  @ApiPropertyOptional({ description: 'Descuento aplicado en MXN' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  DescuentoAplicadoMXN?: number;

  @ApiPropertyOptional({ description: 'Contacto de emergencia' })
  @IsOptional()
  @IsString()
  ContactoEmergencia?: string;

  @ApiPropertyOptional({ description: 'Teléfono de emergencia' })
  @IsOptional()
  @IsString()
  TelefonoEmergencia?: string;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @IsOptional()
  @IsString()
  Ciudad?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsOptional()
  @IsString()
  Estado?: string;

  @ApiPropertyOptional({ description: 'País' })
  @IsOptional()
  @IsString()
  Pais?: string;
}
