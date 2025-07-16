import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './usuarios.schema'
import { UpdateStatusDto } from '@/admins/dto/admins.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { hashPassword, verifyPassword } from '@/utils/password'
import { Condominio, CondominioDocument } from '@/condominios/condominio.schema'
import {
  CreateResidentUserDto,
  UpdateInfoDto,
  UpdatePasswordDto,
} from './dto/usuarios.dto'

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Condominio.name)
    private condominioModel: Model<CondominioDocument>,
  ) {}

  async create(createUserDto: CreateResidentUserDto): Promise<User> {
    // Validar que el condominio exista
    const condominio = await this.condominioModel.findById(
      createUserDto.condominioId,
    )
    if (!condominio) {
      throw new NotFoundException('Condominio no encontrado')
    }

    const condominioObjectId = new Types.ObjectId(createUserDto.condominioId)

    // Crear usuario con password hasheada y condominioId
    const hashedPassword = hashPassword(createUserDto.password)
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      condominioId: condominioObjectId, // Este campo lo debes agregar en el esquema User también
    })

    // Guardar usuario
    const savedUser = await createdUser.save()

    // Agregar el id del usuario creado al array de usuarios del condominio
    condominio.users.push(savedUser._id)
    await condominio.save()

    return savedUser
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec()
  }

  async findOneById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID inválido')
    const user = await this.userModel.findById(id).exec()
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async updateInfo(id: string, dto: UpdateInfoDto): Promise<UserDocument> {
    const user = await this.findOneById(id)
    Object.assign(user, dto)
    return user.save()
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<UserDocument> {
    const user = await this.findOneById(id)
    user.password = hashPassword(dto.password)
    return user.save()
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<UserDocument> {
    const user = await this.findOneById(id)
    user.status = dto.status
    return user.save()
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec()
    if (!user) return null
    const isValid = verifyPassword(password, user.password)
    if (!isValid) return null
    return user
  }
}
