import {
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SuperAdmin, SuperAdminDocument } from './super-admin.schema'
import {
  CreateSuperAdminDto,
} from './dto/create-super-admin.dto'
import { hashPassword } from '@/utils/password'

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(SuperAdmin.name)
    private readonly superAdminModel: Model<SuperAdminDocument>,
  ) {}

  async create(dto: CreateSuperAdminDto) {
    const count = await this.superAdminModel.countDocuments()
    if (count >= 2) {
      throw new BadRequestException('Ya existen dos Super Admins registrados')
    }

    if (await this.superAdminModel.exists({ email: dto.email })) {
      throw new BadRequestException('El email ya está en uso')
    }

    const passwordHash = hashPassword(dto.password)

    const sa = new this.superAdminModel({
      email: dto.email,
      password: passwordHash,
      name: dto.name,
    })

    return sa.save()
  }
   async findByEmail(email: string): Promise<SuperAdminDocument | null> {
    return this.superAdminModel.findOne({ email }).exec()
  }

}
