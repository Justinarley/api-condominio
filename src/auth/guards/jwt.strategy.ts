import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AdminsService } from '@/admins/admins.service'
import { SuperAdminService } from '@/super-admin/super-admin.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }
  async validate(payload: any) {
      console.log('✅ Payload recibido en JwtStrategy:', payload)
    return { id: payload.sub, email: payload.email, role: payload.role }
  }
}
