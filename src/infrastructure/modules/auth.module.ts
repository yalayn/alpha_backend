import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './user.module';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from '@application/use-cases/register-user/register-user.use-case';
import { LoginUseCase } from '@application/use-cases/login/login.use-case';
import { JwtAuthService } from '../adapters/auth/jwt-auth.service';
import { JwtStrategy } from '../adapters/auth/jwt.strategy';
import { AUTH_SERVICE } from '../../domain/ports/auth.service.port';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    JwtStrategy,
    {
      provide: AUTH_SERVICE,
      useClass: JwtAuthService,
    },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
