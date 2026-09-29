import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global para las rutas REST
  app.setGlobalPrefix('api/v1');

  // Configuración global de validación (Requisito 4)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no incluidas en el DTO
      forbidNonWhitelisted: true, // Retorna error HTTP 400 si envían propiedades no permitidas
      transform: true, // Transforma automáticamente los payloads a instancias DTO y convierte tipos implícitos
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 API TechStore ejecutándose en: http://localhost:${port}/api/v1`);
}
bootstrap();
