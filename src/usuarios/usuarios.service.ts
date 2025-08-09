import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './usuarios.schema'
import { CrearSolicitudDto, UpdateStatusDto } from '@/admins/dto/admins.dto'
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
import { Condominio, CondominioDocument } from '@/condominios/condominio.schema'
import * as dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Condominio.name)
    private condominioModel: Model<CondominioDocument>,
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

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec()
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

  async obtenerAreasComunes(userId: string) {
    // 1. Buscar usuario
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('Usuario no encontrado')

    if (!user.departamentoId)
      throw new NotFoundException('Usuario no tiene departamento asignado')

    // 2. Buscar departamento
    const departamento = await this.departamentoModel.findById(
      user.departamentoId,
    )
    if (!departamento) throw new NotFoundException('Departamento no encontrado')

    if (!departamento.condominio)
      throw new NotFoundException('Departamento no tiene condominio asignado')

    // 3. Buscar condominio
    const condominio = await this.condominioModel.findById(
      departamento.condominio,
    )
    if (!condominio) throw new NotFoundException('Condominio no encontrado')

    // 4. Retornar áreas comunes
    return condominio.areasComunes.map((area) => ({
      nombre: area.nombre,
      estado: area.estado,
      descripcion: area.descripcion,
      capacidad: area.capacidad,
    }))
  }

  async solicitarReserva(dto: CrearSolicitudDto, userId: string) {
    // 1. Buscar usuario para obtener departamentoId
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('Usuario no encontrado')
    if (!user.departamentoId)
      throw new NotFoundException('Usuario no tiene departamento asignado')

    // 2. Buscar departamento
    const departamento = await this.departamentoModel.findById(
      user.departamentoId,
    )
    if (!departamento) throw new NotFoundException('Departamento no encontrado')
    if (!departamento.condominio)
      throw new NotFoundException('Departamento no tiene condominio asignado')

    // 3. Buscar condominio
    const condominio = await this.condominioModel.findById(
      departamento.condominio,
    )
    if (!condominio) throw new NotFoundException('Condominio no encontrado')

    // 4. Buscar área comunal
    const area = condominio.areasComunes.find(
      (a) => a.nombre === dto.nombreArea,
    )
    if (!area) throw new NotFoundException('Área comunal no encontrada')

    // 5. Validar conflictos en reservas
    const solicitudes = area.solicitudes || []
    const conflicto = solicitudes.find(
      (s) =>
        s.estado === 'aprobada' &&
        ((dto.fechaInicio >= s.fechaInicio && dto.fechaInicio <= s.fechaFin) ||
          (dto.fechaFin >= s.fechaInicio && dto.fechaFin <= s.fechaFin)),
    )
    if (conflicto) throw new Error('El área ya está reservada en ese horario')

    // 6. Agregar solicitud nueva
    solicitudes.push({
      _id: new Types.ObjectId(),
      usuario: new Types.ObjectId(userId),
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: new Date(dto.fechaFin),
      estado: 'pendiente',
    })

    // 7. Guardar cambios
    await condominio.save()

    return { message: 'Solicitud enviada con éxito' }
  }

  async getDashboardData(userId: string) {
    const pipeline = [
      // 1. Buscar al usuario propietario
      { $match: { _id: new Types.ObjectId(userId), role: 'propietario' } },

      // 2. Traer el departamento
      {
        $lookup: {
          from: 'departamentos',
          localField: 'departamentoId',
          foreignField: '_id',
          as: 'departamento',
        },
      },
      { $unwind: '$departamento' },

      // 3. Traer el condominio desde el departamento
      {
        $lookup: {
          from: 'condominios',
          localField: 'departamento.condominio',
          foreignField: '_id',
          as: 'condominio',
        },
      },
      { $unwind: '$condominio' },

      // 4. Traer el administrador desde la colección "admins"
      {
        $lookup: {
          from: 'admins',
          localField: 'condominio.adminId',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },

      // 5. Contar las solicitudes del usuario en las áreas comunes
      {
        $addFields: {
          solicitudesCount: {
            $sum: {
              $map: {
                input: '$condominio.areasComunes',
                as: 'area',
                in: {
                  $size: {
                    $filter: {
                      input: '$$area.solicitudes',
                      as: 'sol',
                      cond: { $eq: ['$$sol.usuario', '$_id'] },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // 6. Proyección final
      {
        $project: {
          _id: 0,
          usuario: {
            _id: `$_id`,
            name: '$name',
            email: '$email',
            phone: '$phone',
            vehicles: { $ifNull: ['$vehicles', []] },
          },
          departamento: {
            _id: '$departamento._id',
            codigo: '$departamento.codigo',
            nombre: '$departamento.nombre',
            estado: '$departamento.estado',
            grupo: '$departamento.grupo',
            alicuota: '$departamento.alicuota',
          },
          condominio: {
            id: '$condominio.id',
            name: '$condominio.name',
            address: '$condominio.address',
            tipo: '$condominio.tipo',
            gastosMensuales: {
              $filter: {
                input: '$condominio.gastosMensuales',
                as: 'gasto',
                cond: {
                  $eq: ['$$gasto.mes', dayjs().format('MMMM YYYY')],
                },
              },
            },
          },
          solicitudes: '$solicitudesCount',
          administrador: {
            name: '$admin.name',
            email: '$admin.email',
            phone: '$admin.phone',
          },
        },
      },
    ]

    const result = await this.userModel.aggregate(pipeline).exec()
    if (result.length === 0) throw new NotFoundException('Datos no encontrados')
    return result[0]
  }
  async getDashboardDataGuardia(userId: string) {
    const pipeline = [
      // 1. Buscar al usuario guardia
      { $match: { _id: new Types.ObjectId(userId), role: 'guardia' } },

      // 2. Traer el condominio del usuario
      {
        $lookup: {
          from: 'condominios',
          localField: 'condominioId',
          foreignField: '_id',
          as: 'condominio',
        },
      },
      { $unwind: '$condominio' },

      // 3. Traer departamentos completos usando $lookup para condominio.departamentos
      {
        $lookup: {
          from: 'departamentos',
          localField: 'condominio.departamentos', // array de IDs
          foreignField: '_id',
          as: 'departamentosCompleto',
        },
      },

      // 4. Traer administrador desde colección admins
      {
        $lookup: {
          from: 'admins',
          localField: 'condominio.adminId',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },

      // 5. Proyección final con departamentos completos en lugar de solo IDs
      {
        $project: {
          _id: 0,
          usuario: {
            _id: '$_id',
            name: '$name',
            email: '$email',
            phone: '$phone',
          },
          condominio: {
            _id: '$condominio._id',
            name: '$condominio.name',
            address: '$condominio.address',
            tipo: '$condominio.tipo',
            gastosMensuales: {
              $filter: {
                input: '$condominio.gastosMensuales',
                as: 'gasto',
                cond: {
                  $eq: ['$$gasto.mes', dayjs().format('MMMM YYYY')],
                },
              },
            },
          },
          departamentos: '$departamentosCompleto', // aquí los departamentos completos
          administrador: {
            name: '$admin.name',
            email: '$admin.email',
            phone: '$admin.phone',
          },
        },
      },
    ]

    const result = await this.userModel.aggregate(pipeline).exec()
    if (result.length === 0) throw new NotFoundException('Datos no encontrados')
    return result[0]
  }
}
