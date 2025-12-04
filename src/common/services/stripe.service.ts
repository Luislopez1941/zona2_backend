import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('⚠️  STRIPE_SECRET_KEY no configurada. Stripe no estará disponible.');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover', // Versión compatible con Stripe 20.0.0
    });

    console.log('✅ Stripe inicializado correctamente');
  }

  /**
   * Crea un PaymentIntent para procesar un pago
   * @param amount Monto en centavos (ej: 50000 = $500.00 MXN)
   * @param currency Moneda (default: 'mxn')
   * @param metadata Metadatos adicionales (RunnerUID, etc.)
   * @returns PaymentIntent de Stripe
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'mxn',
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error al crear PaymentIntent:', error);
      throw new BadRequestException(`Error al crear el pago: ${error.message}`);
    }
  }

  /**
   * Verifica el estado de un PaymentIntent
   * @param paymentIntentId ID del PaymentIntent
   * @returns PaymentIntent de Stripe
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error al obtener PaymentIntent:', error);
      throw new BadRequestException(`Error al verificar el pago: ${error.message}`);
    }
  }

  /**
   * Verifica si un PaymentIntent fue pagado exitosamente
   * @param paymentIntentId ID del PaymentIntent
   * @returns true si el pago fue exitoso
   */
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = await this.getPaymentIntent(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  }

  /**
   * Valida un webhook de Stripe
   * @param payload Cuerpo del webhook
   * @param signature Firma del webhook
   * @returns Evento de Stripe
   */
  async verifyWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe no está configurado');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET no configurado');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Error al verificar webhook:', error);
      throw new BadRequestException(`Webhook inválido: ${error.message}`);
    }
  }
}

