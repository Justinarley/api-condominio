import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Admin, AdminDocument } from './admin.schemas'
import { CreateAdminDto } from './dto/admins.dto'
import { JwtService } from '@nestjs/jwt'
import { hashPassword } from '@/utils/password'


@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
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

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email }).exec()
  }
}
