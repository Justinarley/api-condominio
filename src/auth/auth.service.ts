import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { SuperAdminService } from '../super-admin/super-admin.service'
import { AdminsService } from '../admins/admins.service'
import { verifyPassword } from '@/utils/password'
import { SuperAdminDocument } from '../super-admin/super-admin.schema'
import { AdminDocument } from '../admins/admin.schemas'

@Injectable()
export class AuthService {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    // Buscar en SuperAdmins
    const superAdmin: SuperAdminDocument | null = await this.superAdminService.findByEmail(email)
    if (superAdmin && verifyPassword(password, superAdmin.password)) {
      return {
        id: superAdmin._id.toString(),
        email: superAdmin.email,
        role: 'super_admin',
      }
    }

    // Buscar en Admins
    const admin: AdminDocument | null = await this.adminsService.findByEmail(email)
    if (admin && verifyPassword(password, admin.password)) {
      return {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
      }
    }

    return null
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
