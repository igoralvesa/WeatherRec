import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Exception filter global para capturar todos os erros
    app.useGlobalFilters(new AllExceptionsFilter());
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const port = process.env.PORT || 3000;
    
    // URL base para o Swagger - usa variável de ambiente ou padrão localhost
    const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;

    // Configuração de CORS mais permissiva para desenvolvimento
    app.enableCors({
      origin: '*', // Permite todas as origens (apenas para desenvolvimento)
      credentials: false, // Desabilitado quando origin é '*'
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
      ],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('GDash API')
      .setDescription('API do sistema GDash - Coleta e Análise de Dados Climáticos')
      .setVersion('1.0')
      .addServer(swaggerServerUrl, 'Servidor local')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // Este nome será usado no decorator @ApiBearerAuth()
      )
      .addTag('auth', 'Endpoints de autenticação')
      .addTag('users', 'Endpoints de usuários')
      .addTag('weather', 'Endpoints de dados climáticos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantém o token após refresh
        tryItOutEnabled: true,
        validatorUrl: null, // Desabilita validação externa que pode causar problemas
        supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'], // Métodos suportados
      },
      customSiteTitle: 'GDash API Documentation',
      customCss: '.swagger-ui .topbar { display: none }', // Remove barra superior do Swagger
    });

    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 API rodando em http://0.0.0.0:${port}`);
    console.log(`📚 Swagger UI disponível em http://localhost:${port}/api`);
  } catch (error) {
    console.error('Erro fatal ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Erro não tratado:', error);
  process.exit(1);
});

