import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio | null = null;

  constructor() {
    // Inicializar cliente de Twilio con credenciales del entorno
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Validar que las credenciales sean válidas antes de inicializar Twilio
    // accountSid debe empezar con "AC" y no ser un placeholder
    if (
      accountSid &&
      authToken &&
      accountSid.startsWith('AC') &&
      accountSid !== 'tu_account_sid_aqui' &&
      authToken !== 'tu_auth_token_aqui' &&
      fromNumber &&
      fromNumber !== '+1234567890'
    ) {
      try {
        this.client = twilio(accountSid, authToken);
        console.log('✅ Twilio inicializado correctamente');
      } catch (error) {
        console.warn('⚠️  Error al inicializar Twilio:', error.message);
        this.client = null;
      }
    } else {
      console.log('⚠️  Twilio no configurado. Usando modo desarrollo (códigos en consola).');
      this.client = null;
    }
  }

  /**
   * Envía un SMS con el código de recuperación
   */
  async sendRecoveryCode(phone: string, code: string): Promise<boolean> {
    try {
      console.log('=== DEBUG SMS ===');
      console.log('Teléfono destino:', phone);
      console.log('Código a enviar:', code);
      console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'NO CONFIGURADO');
      console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
      console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NO CONFIGURADO');
      console.log('Cliente Twilio inicializado:', this.client ? 'Sí' : 'No');

      // Si no hay credenciales de Twilio configuradas, solo loguear (para desarrollo)
      if (!this.client || !process.env.TWILIO_PHONE_NUMBER) {
        console.log(`[SMS - MODO DESARROLLO] Código de recuperación para ${phone}: ${code}`);
        console.log('⚠️  Twilio no configurado. El código se muestra en consola para desarrollo.');
        return true; // Simular envío exitoso en desarrollo
      }

      // Formatear número de teléfono
      // Si no tiene +, asumir que es México (+52) y agregar el código de país
      let formattedPhone: string;
      if (phone.startsWith('+')) {
        formattedPhone = phone;
      } else if (phone.length === 10 && phone.startsWith('9')) {
        // Número mexicano de 10 dígitos que empieza con 9, agregar +52
        formattedPhone = `+52${phone}`;
      } else if (phone.length === 10) {
        // Número mexicano de 10 dígitos, agregar +52
        formattedPhone = `+52${phone}`;
      } else {
        // Cualquier otro caso, solo agregar +
        formattedPhone = `+${phone}`;
      }
      console.log('Teléfono formateado:', formattedPhone);

      const messageBody = `Tu código de recuperación de contraseña Zona 2 es: ${code}. Válido por 10 minutos.`;
      console.log('Mensaje a enviar:', messageBody);

      const message = await this.client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log('✅ SMS enviado exitosamente');
      console.log('Twilio SID:', message.sid);
      console.log('Estado:', message.status);
      console.log('==================');
      return true;
    } catch (error: any) {
      console.error('❌ Error al enviar SMS:');
      console.error('Tipo de error:', error?.constructor?.name || 'Unknown');
      console.error('Mensaje:', error?.message || 'Sin mensaje');
      if (error?.code) {
        console.error('Código de error Twilio:', error.code);
      }
      if (error?.moreInfo) {
        console.error('Más información:', error.moreInfo);
      }
      if (error?.status) {
        console.error('Status HTTP:', error.status);
      }
      if (error?.stack) {
        console.error('Stack:', error.stack);
      }
      
      // Errores comunes de Twilio
      if (error?.code === 21211) {
        console.error('⚠️  El número de teléfono no es válido');
      } else if (error?.code === 21608) {
        console.error('⚠️  El número no está verificado en tu cuenta de Twilio (cuenta de prueba)');
      } else if (error?.code === 21614) {
        console.error('⚠️  El número de teléfono no puede recibir SMS');
      }
      
      console.log('==================');
      return false;
    }
  }

  /**
   * Envía un SMS con código OTP (para login)
   */
  async sendOtpCode(phone: string, code: string): Promise<boolean> {
    try {
      console.log('=== DEBUG SMS ===');
      console.log('Teléfono destino:', phone);
      console.log('Código a enviar:', code);
      console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'NO CONFIGURADO');
      console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
      console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NO CONFIGURADO');
      console.log('Cliente Twilio inicializado:', this.client ? 'Sí' : 'No');

      // Si no hay credenciales de Twilio configuradas, solo loguear (para desarrollo)
      if (!this.client || !process.env.TWILIO_PHONE_NUMBER) {
        console.log(`[SMS - MODO DESARROLLO] Código de acceso para ${phone}: ${code}`);
        console.log('⚠️  Twilio no configurado. El código se muestra en consola para desarrollo.');
        return true; // Simular envío exitoso en desarrollo
      }

      // Formatear número de teléfono
      // Si no tiene +, asumir que es México (+52) y agregar el código de país
      let formattedPhone: string;
      if (phone.startsWith('+')) {
        formattedPhone = phone;
      } else if (phone.length === 10 && phone.startsWith('9')) {
        // Número mexicano de 10 dígitos que empieza con 9, agregar +52
        formattedPhone = `+52${phone}`;
      } else if (phone.length === 10) {
        // Número mexicano de 10 dígitos, agregar +52
        formattedPhone = `+52${phone}`;
      } else {
        // Cualquier otro caso, solo agregar +
        formattedPhone = `+${phone}`;
      }
      console.log('Teléfono formateado:', formattedPhone);

      const messageBody = `Tu código de acceso Zona 2 es: ${code}. Válido por 10 minutos.`;
      console.log('Mensaje a enviar:', messageBody);

      const message = await this.client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log('✅ SMS enviado exitosamente');
      console.log('Twilio SID:', message.sid);
      console.log('Estado:', message.status);
      console.log('==================');
      return true;
    } catch (error: any) {
      console.error('❌ Error al enviar SMS:');
      console.error('Tipo de error:', error?.constructor?.name || 'Unknown');
      console.error('Mensaje:', error?.message || 'Sin mensaje');
      if (error?.code) {
        console.error('Código de error Twilio:', error.code);
      }
      if (error?.moreInfo) {
        console.error('Más información:', error.moreInfo);
      }
      if (error?.status) {
        console.error('Status HTTP:', error.status);
      }
      if (error?.stack) {
        console.error('Stack:', error.stack);
      }
      
      // Errores comunes de Twilio
      if (error?.code === 21211) {
        console.error('⚠️  El número de teléfono no es válido');
      } else if (error?.code === 21608) {
        console.error('⚠️  El número no está verificado en tu cuenta de Twilio (cuenta de prueba)');
      } else if (error?.code === 21614) {
        console.error('⚠️  El número de teléfono no puede recibir SMS');
      }
      
      console.log('==================');
      return false;
    }
  }

  /**
   * Envía un SMS genérico
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      if (!this.client || !process.env.TWILIO_PHONE_NUMBER) {
        console.log(`[SMS] Mensaje para ${phone}: ${message}`);
        return true;
      }

      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`SMS enviado exitosamente. SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Error al enviar SMS:', error);
      return false;
    }
  }
}

