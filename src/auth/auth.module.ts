import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { SuperAdminModule } from '../super-admin/super-admin.module'
import { AdminsModule } from '../admins/admins.module'
import { JwtStrategy } from './guards/jwt.strategy'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    SuperAdminModule,
    AdminsModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtStrategy, AuthService, JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
