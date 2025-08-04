import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Admin, AdminDocument } from './admin.schemas'
import {
  Condominio,
  CondominioDocument,
} from '../condominios/condominio.schema'
import {
  Departamento,
  DepartamentoDocument,
} from '../departamentos/departamento.schema'
import { User, UserDocument } from '@/usuarios/usuarios.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Condominio.name)
    private condominioModel: Model<CondominioDocument>,
    @InjectModel(Departamento.name)
    private departamentoModel: Model<DepartamentoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Obtener admin y condominios asignados
  private async getAdminWithCondominios(adminId: string) {
    const admin = await this.adminModel.findById(adminId).exec()
    if (!admin) {
      console.log('Admin no encontrado')
      throw new NotFoundException('Admin no encontrado')
    }
    return admin
  }

  // Obtener condominios asignados con sus departamentos (solo lectura)
  async obtenerCondominiosConDepartamentos(adminId: string) {
    const admin = await this.getAdminWithCondominios(adminId)

    const condominios = await this.condominioModel
      .find({ _id: { $in: admin.condominios } })
      .sort({ createdAt: -1 })
      .lean()

    const condominiosConInfo = await Promise.all(
      condominios.map(async (condominio) => {
        // departamentos del condominio
        const departamentos = await this.departamentoModel
          .find({ condominio: condominio._id })
          .lean()

        const departamentoIds = departamentos.map((d) => d._id)

        // contar usuarios activos e inactivos en esos departamentos
        const usuariosActivos = await this.userModel.countDocuments({
          departamentoId: { $in: departamentoIds },
          status: 'active',
        })

        const usuariosInactivos = await this.userModel.countDocuments({
          departamentoId: { $in: departamentoIds },
          status: 'inactive',
        })

        return {
          ...condominio,
          totalDepartamentos: departamentos.length,
          usuariosActivos,
          usuariosInactivos,
        }
      }),
    )

    return condominiosConInfo
  }

  async aprobarUsuario(
    adminId: string,
    userId: string,
    aprobar: boolean,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec()
    if (!user) throw new NotFoundException('Usuario no encontrado')

    if (user.status !== 'inactive') {
      throw new Error('Usuario ya ha sido aprobado o rechazado')
    }

    if (aprobar) {
      // Actualizar usuario a activo
      user.status = 'active'
      await user.save()

      // Actualizar departamento asignando propietario y estado ocupado
      if (user.departamentoId) {
        const departamento = await this.departamentoModel.findById(
          user.departamentoId,
        )
        if (!departamento)
          throw new NotFoundException('Departamento no encontrado')

        departamento.propietario = user._id
        departamento.estado = 'ocupado'
        await departamento.save()
      }
    }

    return user
  }

  async obtenerUsuariosPorRolYEstado(
    adminId: string,
    role?: string,
    status?: string,
  ): Promise<any[]> {
    const admin = await this.getAdminWithCondominios(adminId)
    const condominioIds = admin.condominios

    const query: any = {
      condominioId: { $in: condominioIds },
    }
    if (role) query.role = role
    if (status) query.status = status

    const usuarios = await this.userModel
      .find(query)
      .populate('departamentoId', 'codigo')
      .populate('condominioId', 'name')
      .lean()

    return usuarios.map((user) => {
      const departamento = user.departamentoId as any
      const condominio = user.condominioId as any

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        identificationNumber: user.identificationNumber,
        role: user.role,
        status: user.status,
        departamentoCodigo: departamento?.codigo || 'N/A',
        condominioNombre: condominio?.name || 'N/A',
      }
    })
  }

  async contarGuardiasPorEstado(adminId: string) {
    const admin = await this.getAdminWithCondominios(adminId)
    const condominioIds = admin.condominios

    const activos = await this.userModel.countDocuments({
      condominioId: { $in: condominioIds },
      role: 'guardia',
      status: 'active',
    })

    const inactivos = await this.userModel.countDocuments({
      condominioId: { $in: condominioIds },
      role: 'guardia',
      status: 'inactive',
    })

    return { activos, inactivos }
  }
}
