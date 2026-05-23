import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Verifica que el servicio esté activo y con conectividad a la base de datos.' })
  @ApiResponse({ status: 200, description: 'Servicio operativo' })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  check() {
    // connection.readyState === 1 significa conectado
    const isDbConnected = this.connection.readyState === 1;
    
    if (!isDbConnected) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        error: 'service_unavailable',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        path: '/health'
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}
