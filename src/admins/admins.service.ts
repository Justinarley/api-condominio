import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Admin, AdminDocument } from './admin.schemas'
import {
  CreateAdminDto,
  UpdateInfoDto,
  UpdatePasswordDto,
  UpdateStatusDto,
} from './dto/admins.dto'

import { hashPassword } from '@/utils/password'

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const hashedPassword = hashPassword(createAdminDto.password)
    const createdAdmin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    })
    return createdAdmin.save()
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find().exec()
  }

  async findOneById(id: string): Promise<AdminDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID inválido')
    const admin = await this.adminModel.findById(id).exec()
    if (!admin) throw new NotFoundException('Admin no encontrado')
    return admin
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<AdminDocument> {
    const admin = await this.findOneById(id)
    admin.password = hashPassword(dto.password)
    return admin.save()
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<AdminDocument> {
    const admin = await this.findOneById(id)
    admin.status = dto.status
    return admin.save()
  }

  async updateInfo(id: string, dto: UpdateInfoDto): Promise<AdminDocument> {
    const admin = await this.findOneById(id)
    if (dto.email) admin.email = dto.email
    if (dto.phone) admin.phone = dto.phone
    if (dto.address) admin.address = dto.address
    return admin.save()
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email }).exec()
  }
}
