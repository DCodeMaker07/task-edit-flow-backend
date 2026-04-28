import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  app.enableCors(); // CORS habilitado

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter()); // Global exception filter

  app.useGlobalInterceptors(new ResponseInterceptor()); // Global response interceptor

  // Swagger configuración
  const config = new DocumentBuilder()
    .setTitle('TaskFlow Pro API')
    .setDescription('Task Management System API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger documentation at http://localhost:${port}/api/docs`);
}
bootstrap();
