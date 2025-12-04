import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      this.logger.warn('⚠️  STRIPE_SECRET_KEY no configurada. Stripe no estará disponible.');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover', // Versión compatible con Stripe 20.0.0
    });

    this.logger.log('✅ Stripe inicializado correctamente');
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
      this.logger.error('Stripe no está configurado');
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    // Validar amount
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      this.logger.error(`Invalid amount: ${amount}`);
      throw new BadRequestException('El monto debe ser un número entero mayor a 0 (en centavos)');
    }

    // Validar currency
    const validCurrencies = ['mxn', 'usd', 'eur'];
    const normalizedCurrency = currency.toLowerCase();
    if (!validCurrencies.includes(normalizedCurrency)) {
      this.logger.error(`Invalid currency: ${currency}`);
      throw new BadRequestException(`Moneda no válida. Debe ser una de: ${validCurrencies.join(', ')}`);
    }

    this.logger.log(`Creating PaymentIntent - amount: ${amount}, currency: ${normalizedCurrency}, metadata: ${JSON.stringify(metadata)}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: normalizedCurrency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      this.logger.log(`PaymentIntent created successfully - ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error al crear PaymentIntent: ${error.message}`, error.stack);
      
      // Mejorar el mensaje de error según el tipo
      if (error.type === 'StripeInvalidRequestError') {
        throw new BadRequestException(`Error de Stripe: ${error.message}`);
      } else if (error.statusCode === 404) {
        throw new BadRequestException('Recurso de Stripe no encontrado. Verifica la configuración de Stripe.');
      } else if (error.statusCode === 400) {
        throw new BadRequestException(`Datos inválidos para crear el pago: ${error.message}`);
      }
      
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
      this.logger.error('Stripe no está configurado');
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    if (!paymentIntentId) {
      this.logger.error('paymentIntentId is required');
      throw new BadRequestException('paymentIntentId es requerido');
    }

    this.logger.log(`Retrieving PaymentIntent: ${paymentIntentId}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      this.logger.log(`PaymentIntent retrieved - ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error al obtener PaymentIntent ${paymentIntentId}: ${error.message}`, error.stack);
      
      // Mejorar el mensaje de error según el tipo
      if (error.type === 'StripeInvalidRequestError') {
        if (error.statusCode === 404) {
          throw new BadRequestException(`PaymentIntent no encontrado: ${paymentIntentId}`);
        }
        throw new BadRequestException(`Error de Stripe: ${error.message}`);
      }
      
      throw new BadRequestException(`Error al verificar el pago: ${error.message}`);
    }
  }

  /**
   * Confirma un PaymentIntent con un PaymentMethod
   * @param paymentIntentId ID del PaymentIntent
   * @param paymentMethodId ID del PaymentMethod creado en el frontend
   * @returns PaymentIntent confirmado
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      this.logger.error('Stripe no está configurado');
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    if (!paymentIntentId || !paymentMethodId) {
      this.logger.error('paymentIntentId and paymentMethodId are required');
      throw new BadRequestException('paymentIntentId y paymentMethodId son requeridos');
    }

    this.logger.log(`Confirming PaymentIntent ${paymentIntentId} with PaymentMethod ${paymentMethodId}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      this.logger.log(`PaymentIntent confirmed - ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error al confirmar PaymentIntent: ${error.message}`, error.stack);
      
      if (error.type === 'StripeCardError') {
        throw new BadRequestException(`Error en la tarjeta: ${error.message}`);
      } else if (error.type === 'StripeInvalidRequestError') {
        throw new BadRequestException(`Error de Stripe: ${error.message}`);
      }
      
      throw new BadRequestException(`Error al procesar el pago: ${error.message}`);
    }
  }

  /**
   * Crea un PaymentMethod con los datos de la tarjeta
   * NOTA: Requiere habilitar acceso a APIs de datos de tarjeta sin procesar en Stripe
   * Para desarrollo: https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis
   * @param cardNumber Número de tarjeta
   * @param expMonth Mes de expiración (1-12)
   * @param expYear Año de expiración (4 dígitos)
   * @param cvc Código de seguridad
   * @returns PaymentMethod de Stripe
   */
  async createPaymentMethod(
    cardNumber: string,
    expMonth: number,
    expYear: number,
    cvc: string,
  ): Promise<Stripe.PaymentMethod> {
    if (!this.stripe) {
      this.logger.error('Stripe no está configurado');
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    // Validar datos de tarjeta
    if (!cardNumber || cardNumber.trim().length < 13 || cardNumber.trim().length > 19) {
      throw new BadRequestException(
        'Número de tarjeta inválido. ' +
        'Para desarrollo, usa números de tarjeta de prueba de Stripe (4242424242424242, etc.) ' +
        'o habilitar acceso a APIs de datos de tarjeta sin procesar en tu cuenta de Stripe. ' +
        'Ver: https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis'
      );
    }

    if (!expMonth || expMonth < 1 || expMonth > 12) {
      throw new BadRequestException('Mes de expiración inválido (debe ser 1-12)');
    }

    if (!expYear || expYear < 2024) {
      throw new BadRequestException('Año de expiración inválido');
    }

    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      throw new BadRequestException('CVC inválido (debe tener 3 o 4 dígitos)');
    }

    // Limpiar número de tarjeta (remover espacios)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    this.logger.log(`Creating PaymentMethod for card ending in ${cleanCardNumber.slice(-4)}`);

    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cleanCardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc,
        },
      });

      this.logger.log(`PaymentMethod created successfully - ID: ${paymentMethod.id}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Error al crear PaymentMethod: ${error.message}`, error.stack);
      
      if (error.type === 'StripeCardError') {
        throw new BadRequestException(`Error en la tarjeta: ${error.message}`);
      } else if (error.type === 'StripeInvalidRequestError') {
        // Mensaje más útil para el error común
        if (error.message.includes('unsafe') || error.message.includes('raw card data')) {
          throw new BadRequestException(
            'Stripe no permite enviar números de tarjeta directamente por seguridad. ' +
            'OPCIONES:\n' +
            '1. Para desarrollo: Habilitar acceso a APIs de datos de tarjeta sin procesar en tu cuenta de Stripe. ' +
            '   Ver: https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis\n' +
            '2. Para producción: Usar Stripe.js en el frontend (recomendado y más seguro)\n' +
            '3. Usar números de tarjeta de prueba de Stripe (4242424242424242) después de habilitar el acceso'
          );
        }
        throw new BadRequestException(`Error de Stripe: ${error.message}`);
      }
      
      throw new BadRequestException(`Error al crear el método de pago: ${error.message}`);
    }
  }

  /**
   * Crea y confirma un PaymentIntent en un solo paso
   * @param amount Monto en centavos
   * @param currency Moneda
   * @param paymentMethodId ID del PaymentMethod
   * @param metadata Metadatos adicionales
   * @returns PaymentIntent confirmado
   */
  async createAndConfirmPaymentIntent(
    amount: number,
    currency: string = 'mxn',
    paymentMethodId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      this.logger.error('Stripe no está configurado');
      throw new BadRequestException('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en .env');
    }

    // Validar amount
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      this.logger.error(`Invalid amount: ${amount}`);
      throw new BadRequestException('El monto debe ser un número entero mayor a 0 (en centavos)');
    }

    // Validar currency
    const validCurrencies = ['mxn', 'usd', 'eur'];
    const normalizedCurrency = currency.toLowerCase();
    if (!validCurrencies.includes(normalizedCurrency)) {
      this.logger.error(`Invalid currency: ${currency}`);
      throw new BadRequestException(`Moneda no válida. Debe ser una de: ${validCurrencies.join(', ')}`);
    }

    if (!paymentMethodId) {
      this.logger.error('paymentMethodId is required');
      throw new BadRequestException('paymentMethodId es requerido');
    }

    this.logger.log(`Creating and confirming PaymentIntent - amount: ${amount}, currency: ${normalizedCurrency}, paymentMethodId: ${paymentMethodId}`);

    try {
      // Crear el PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: normalizedCurrency,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: 'https://your-website.com/return', // Puedes ajustar esto
        metadata: metadata || {},
      });

      this.logger.log(`PaymentIntent created and confirmed - ID: ${paymentIntent.id}, status: ${paymentIntent.status}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error al crear y confirmar PaymentIntent: ${error.message}`, error.stack);
      
      if (error.type === 'StripeCardError') {
        throw new BadRequestException(`Error en la tarjeta: ${error.message}`);
      } else if (error.type === 'StripeInvalidRequestError') {
        throw new BadRequestException(`Error de Stripe: ${error.message}`);
      }
      
      throw new BadRequestException(`Error al procesar el pago: ${error.message}`);
    }
  }

  /**
   * Verifica si un PaymentIntent fue pagado exitosamente
   * @param paymentIntentId ID del PaymentIntent
   * @returns true si el pago fue exitoso
   */
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    this.logger.log(`Verifying payment for PaymentIntent: ${paymentIntentId}`);
    try {
    const paymentIntent = await this.getPaymentIntent(paymentIntentId);
      const isSucceeded = paymentIntent.status === 'succeeded';
      this.logger.log(`Payment verification result for ${paymentIntentId}: ${isSucceeded} (status: ${paymentIntent.status})`);
      return isSucceeded;
    } catch (error) {
      this.logger.error(`Error verifying payment ${paymentIntentId}: ${error.message}`, error.stack);
      throw error;
    }
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

