import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto'
import { SuperAdmin, SuperAdminDocument } from './super-admin.schema'
import {
  CreateSuperAdminDto,
  LoginSuperAdminDto,
} from './dto/create-super-admin.dto'

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(SuperAdmin.name)
    private readonly superAdminModel: Model<SuperAdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHash] = storedHash.split(':')
    const hashBuffer = Buffer.from(originalHash, 'hex')
    const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    return timingSafeEqual(hashBuffer, hashToVerify)
  }

  async create(dto: CreateSuperAdminDto) {
    const count = await this.superAdminModel.countDocuments()
    if (count >= 2) {
      throw new BadRequestException('Ya existen dos Super Admins registrados')
    }
    if (await this.superAdminModel.exists({ email: dto.email })) {
      throw new BadRequestException('El email ya está en uso')
    }

    const passwordHash = this.hashPassword(dto.password)

    const sa = new this.superAdminModel({
      email: dto.email,
      password: passwordHash,
    })

    return sa.save()
  }

  async login(dto: LoginSuperAdminDto) {
    const sa: SuperAdminDocument | null = await this.superAdminModel
      .findOne({ email: dto.email })
      .exec()

    if (!sa || !this.verifyPassword(dto.password, sa.password)) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const payload = {
      sub: sa._id.toString(),
      email: sa.email,
      role: sa.role,
    }

    return { access_token: this.jwtService.sign(payload) }
  }
}
