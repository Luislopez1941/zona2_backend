import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPaymentPacerDto {
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
}

