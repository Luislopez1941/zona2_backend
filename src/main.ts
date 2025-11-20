import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Agregar prefijo global 'api' a todas las rutas
  app.setGlobalPrefix('api');
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Zona 2 API')
    .setDescription('Documentación de la API de Zona 2')
    .setVersion('1.0')
    .addTag('actividades')
    .addTag('zonas')
    .addTag('sec_users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  
  // Habilitar CORS para todos los orígenes
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Interceptor global para convertir BigInt a string
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
