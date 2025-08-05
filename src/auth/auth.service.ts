import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { verifyPassword } from '@/utils/password'
import { AdminDocument } from '../admins/admin.schemas'
import { AdminsService } from '../admins/admins.service'
import { SuperAdminDocument } from '../super-admin/super-admin.schema'
import { SuperAdminService } from '../super-admin/super-admin.service'
import { UsuariosService } from '@/usuarios/usuarios.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly usuariosService: UsuariosService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const superAdmin: SuperAdminDocument | null =
      await this.superAdminService.findByEmail(email)
    if (superAdmin && verifyPassword(password, superAdmin.password)) {
      return {
        id: superAdmin._id.toString(),
        email: superAdmin.email,
        role: 'super_admin',
        name: superAdmin.name,
      }
    }

    const admin: AdminDocument | null =
      await this.adminsService.findByEmail(email)
    if (
      admin &&
      admin.status === 'active' &&
      verifyPassword(password, admin.password)
    ) {
      return {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
        name: admin.name,
      }
    }

    const usuario = await this.usuariosService.validateUser(email, password)
    if (usuario && usuario.status === 'active') {
      return {
        id: usuario._id.toString(),
        email: usuario.email,
        role: usuario.role,
        name: usuario.name,
      }
    }

    return null
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
