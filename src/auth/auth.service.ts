import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verifyPassword } from '@/utils/password'
import { AdminDocument } from '../admins/admin.schemas'
import { AdminsService } from '../admins/admins.service'
import { SuperAdminDocument } from '../super-admin/super-admin.schema'
import { SuperAdminService } from '../super-admin/super-admin.service'
import { UsuariosService } from '@/usuarios/usuarios.service'
import { UserDocument } from '@/usuarios/usuarios.schema'

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
    if (admin) {
      if (!verifyPassword(password, admin.password)) {
        throw new UnauthorizedException('Credenciales incorrectas')
      }

      if (admin.status !== 'active') {
        throw new UnauthorizedException('El administrador está inactivo')
      }

      return {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
        name: admin.name,
      }
    }

    const usuario: UserDocument | null =
      await this.usuariosService.findByEmail(email)
    if (usuario) {
      if (!verifyPassword(password, usuario.password)) {
        throw new UnauthorizedException('Credenciales incorrectas')
      }

      if (usuario.status !== 'active') {
        throw new UnauthorizedException('El usuario está inactivo')
      }

      return {
        id: usuario._id.toString(),
        email: usuario.email,
        role: usuario.role,
        name: usuario.name,
      }
    }

    throw new UnauthorizedException('Usuario no encontrado')
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
