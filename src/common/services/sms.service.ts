import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private apiKey: string | null = null;
  private apiUrl = 'https://platform.clickatell.com/messages';
  private acceptedCodes = [200, 201, 202];

  constructor() {
    // Inicializar Clickatell con la API key del entorno
    // Puede usar CLICKATELL_AUTHORIZATION_TOKEN o CLICKATELL_API_KEY
    this.apiKey = process.env.CLICKATELL_AUTHORIZATION_TOKEN || process.env.CLICKATELL_API_KEY || null;

    if (this.apiKey && this.apiKey !== 'tu_api_key_aqui') {
      console.log('✅ Clickatell inicializado correctamente');
      console.log('URL de API:', this.apiUrl);
    } else {
      console.log('⚠️  Clickatell no configurado. Usando modo desarrollo (códigos en consola).');
    }
  }

  /**
   * Formatea el número de teléfono para Clickatell
   * Clickatell requiere números en formato internacional sin el signo +
   */
  private formatPhone(phone: string): string {
    let formattedPhone: string;
    
    // Si ya tiene +, removerlo
    if (phone.startsWith('+')) {
      formattedPhone = phone.substring(1);
    } else if (phone.length === 10) {
      // Número mexicano de 10 dígitos, agregar código de país 52
      formattedPhone = `52${phone}`;
    } else {
      // Cualquier otro caso, usar tal cual
      formattedPhone = phone;
    }
    
    return formattedPhone;
  }

  /**
   * Envía un SMS usando la API de Clickatell (Platform API)
   */
  private async sendSmsClickatell(phone: string, message: string): Promise<boolean> {
    try {
      // Si no hay API key configurada, solo loguear (para desarrollo)
      if (!this.apiKey || this.apiKey === 'tu_api_key_aqui') {
        console.log(`[SMS - MODO DESARROLLO] Mensaje para ${phone}: ${message}`);
        return true; // Simular envío exitoso en desarrollo
      }

      const formattedPhone = this.formatPhone(phone);
      
      // Limpiar la API key (remover espacios y comillas si las hay)
      const cleanApiKey = this.apiKey.trim().replace(/^["']|["']$/g, '');
      
      console.log('=== DEBUG Clickatell Request ===');
      console.log('URL:', this.apiUrl);
      console.log('API Key length:', cleanApiKey.length);
      console.log('Teléfono formateado:', formattedPhone);
      console.log('Mensaje:', message);
      
      const requestBody = {
        content: message,
        to: [formattedPhone],
      };
      
      console.log('Request Body:', JSON.stringify(requestBody));
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': cleanApiKey, // Token directo, sin "Bearer"
        },
        body: JSON.stringify(requestBody),
      });

      const httpCode = response.status;
      console.log('HTTP Status Code:', httpCode);

      // Verificar si el código HTTP está en los aceptados (200, 201, 202)
      if (!this.acceptedCodes.includes(httpCode)) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        console.error('❌ Error al enviar SMS con Clickatell:');
        console.error('Status:', httpCode);
        console.error('Status Text:', response.statusText);
        console.error('Error Data:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ SMS enviado exitosamente con Clickatell');
      console.log('Response:', result);
      return true;
    } catch (error: any) {
      console.error('❌ Error al enviar SMS con Clickatell:');
      console.error('Tipo de error:', error?.constructor?.name || 'Unknown');
      console.error('Mensaje:', error?.message || 'Sin mensaje');
      if (error?.stack) {
        console.error('Stack:', error.stack);
      }
      return false;
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
      console.log('CLICKATELL_AUTHORIZATION_TOKEN:', process.env.CLICKATELL_AUTHORIZATION_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
      console.log('CLICKATELL_API_KEY:', process.env.CLICKATELL_API_KEY ? 'Configurado' : 'NO CONFIGURADO');

      // Si no hay credenciales de Clickatell configuradas, solo loguear (para desarrollo)
      if (!this.apiKey || this.apiKey === 'tu_api_key_aqui') {
        console.log(`[SMS - MODO DESARROLLO] Código de recuperación para ${phone}: ${code}`);
        console.log('⚠️  Clickatell no configurado. El código se muestra en consola para desarrollo.');
        return true; // Simular envío exitoso en desarrollo
      }

      const formattedPhone = this.formatPhone(phone);
      console.log('Teléfono formateado:', formattedPhone);

      const messageBody = `Tu código de recuperación de contraseña Zona 2 es: ${code}. Válido por 10 minutos.`;
      console.log('Mensaje a enviar:', messageBody);

      const success = await this.sendSmsClickatell(formattedPhone, messageBody);

      if (success) {
        console.log('✅ SMS enviado correctamente');
        console.log('==================');
      } else {
        console.log('❌ No se pudo enviar el SMS');
        console.log('==================');
      }

      return success;
    } catch (error: any) {
      console.error('❌ Error al enviar SMS:');
      console.error('Tipo de error:', error?.constructor?.name || 'Unknown');
      console.error('Mensaje:', error?.message || 'Sin mensaje');
      if (error?.stack) {
        console.error('Stack:', error.stack);
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
      console.log('CLICKATELL_AUTHORIZATION_TOKEN:', process.env.CLICKATELL_AUTHORIZATION_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
      console.log('CLICKATELL_API_KEY:', process.env.CLICKATELL_API_KEY ? 'Configurado' : 'NO CONFIGURADO');

      // Si no hay credenciales de Clickatell configuradas, solo loguear (para desarrollo)
      if (!this.apiKey || this.apiKey === 'tu_api_key_aqui') {
        console.log(`[SMS - MODO DESARROLLO] Código de acceso para ${phone}: ${code}`);
        console.log('⚠️  Clickatell no configurado. El código se muestra en consola para desarrollo.');
        return true; // Simular envío exitoso en desarrollo
      }

      const formattedPhone = this.formatPhone(phone);
      console.log('Teléfono formateado:', formattedPhone);

      const messageBody = `Tu código de acceso Zona 2 es: ${code}. Válido por 10 minutos.`;
      console.log('Mensaje a enviar:', messageBody);

      const success = await this.sendSmsClickatell(formattedPhone, messageBody);

      if (success) {
        console.log('✅ SMS enviado correctamente');
        console.log('==================');
      } else {
        console.log('❌ No se pudo enviar el SMS');
        console.log('==================');
      }

      return success;
    } catch (error: any) {
      console.error('❌ Error al enviar SMS:');
      console.error('Tipo de error:', error?.constructor?.name || 'Unknown');
      console.error('Mensaje:', error?.message || 'Sin mensaje');
      if (error?.stack) {
        console.error('Stack:', error.stack);
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
      if (!this.apiKey || this.apiKey === 'tu_api_key_aqui') {
        console.log(`[SMS] Mensaje para ${phone}: ${message}`);
        return true;
      }

      const formattedPhone = this.formatPhone(phone);
      return await this.sendSmsClickatell(formattedPhone, message);
    } catch (error) {
      console.error('Error al enviar SMS:', error);
      return false;
    }
  }
}
