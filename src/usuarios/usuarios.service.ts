import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './usuarios.schema'
import { UpdateStatusDto } from '@/admins/dto/admins.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { hashPassword, verifyPassword } from '@/utils/password'
import {
  CreateResidentUserDto,
  UpdateInfoDto,
  UpdatePasswordDto,
} from './dto/usuarios.dto'
import {
  Departamento,
  DepartamentoDocument,
} from '@/departamentos/departamento.schema'

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Departamento.name)
    private departamentoModel: Model<DepartamentoDocument>,
  ) {}

  async create(createUserDto: CreateResidentUserDto): Promise<User> {
    const dataToSave: any = {
      ...createUserDto,
      password: hashPassword(createUserDto.password),
      status: 'inactive',
    }

    if (createUserDto.role === 'propietario') {
      if (!createUserDto.departamentoId) {
        throw new NotFoundException(
          'Departamento es obligatorio para propietarios',
        )
      }

      const departamento = await this.departamentoModel.findById(
        createUserDto.departamentoId,
      )
      if (!departamento) {
        throw new NotFoundException('Departamento no encontrado')
      }

      if (departamento.propietario) {
        throw new Error('Departamento ya tiene un propietario asignado')
      }

      dataToSave.departamentoId = new Types.ObjectId(
        createUserDto.departamentoId,
      )
      dataToSave.condominioId = departamento.condominio // Relacionar también al condominio
    }

    // 👇 Nueva lógica para GUARDIA
    else if (createUserDto.role === 'guardia') {
      if (!createUserDto.condominioId) {
        throw new NotFoundException('Condominio es obligatorio para guardias')
      }
      dataToSave.condominioId = new Types.ObjectId(createUserDto.condominioId)
      dataToSave.departamentoId = null // Asegurar que no tenga departamento
    }

    // Otros roles (residente, etc.)
    else {
      dataToSave.departamentoId = null
      dataToSave.condominioId = null
    }

    const createdUser = new this.userModel(dataToSave)
    return await createdUser.save()
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
