import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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
import { UpdateInfoDto } from './dto/admins.dto'

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
  async findOneById(id: string): Promise<AdminDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID inválido')
    const admin = await this.adminModel.findById(id).exec()
    if (!admin) throw new NotFoundException('Admin no encontrado')
    return admin
  }

  async updateInfos(id: string, dto: UpdateInfoDto): Promise<AdminDocument> {
    const admin = await this.findOneById(id)
    if (dto.email) admin.email = dto.email
    if (dto.phone) admin.phone = dto.phone
    if (dto.address) admin.address = dto.address
    return admin.save()
  }

  // Obtener condominios asignados con sus departamentos (solo lectura)
  async obtenerCondominiosConDepartamentos(
    adminId: string,
    condominioId?: string,
  ) {
    const admin = await this.getAdminWithCondominios(adminId)

    // Si tienes filtro condominioId, filtramos
    let filter = { _id: { $in: admin.condominios } } as any
    if (condominioId) filter._id = condominioId

    const condominios = await this.condominioModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()

    // El resto igual, map y agrega conteos
    const condominiosConInfo = await Promise.all(
      condominios.map(async (condominio) => {
        const departamentos = await this.departamentoModel
          .find({ condominio: condominio._id })
          .lean()
        const departamentoIds = departamentos.map((d) => d._id)

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
    condominioId?: string,
  ): Promise<any[]> {
    const admin = await this.getAdminWithCondominios(adminId)
    const condominioIds = admin.condominios

    let condominioIdsFiltrados = condominioIds
    if (condominioId) {
      // Convertir string a ObjectId
      const condominioObjectId = new Types.ObjectId(condominioId)

      // Verificar que admin tenga acceso
      if (!condominioIds.some((id) => id.equals(condominioObjectId))) {
        throw new ForbiddenException('No tienes acceso a ese condominio')
      }

      condominioIdsFiltrados = [condominioObjectId]
    }

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

  async obtenerSolicitudesReserva(adminId: string, condominioId?: string) {
    const admin = await this.getAdminWithCondominios(adminId)

    // Filtra condominios solo a los que el admin tiene acceso
    let condominios = await this.condominioModel.find({
      _id: { $in: admin.condominios },
    })

    // Si se pasa condominioId, filtra solo ese
    if (condominioId) {
      condominios = condominios.filter((c) => c._id.toString() === condominioId)
    }

    const solicitudes: any[] = []

    for (const condominio of condominios) {
      for (const area of condominio.areasComunes) {
        for (const solicitud of area.solicitudes || []) {
          if (
            solicitud.estado === 'pendiente' ||
            solicitud.estado === 'aprobada'
          ) {
            solicitudes.push({
              condominioId: condominio._id,
              nombreCondominio: condominio.name,
              nombreArea: area.nombre,
              descripcionArea: area.descripcion,
              capacidadArea: area.capacidad,
              solicitudId: (solicitud as any)._id,
              usuarioId: solicitud.usuario,
              fechaInicio: solicitud.fechaInicio,
              fechaFin: solicitud.fechaFin,
              estado: solicitud.estado,
            })
          }
        }
      }
    }

    return solicitudes
  }

  async actualizarEstadoSolicitudReserva(
    condominioId: string,
    solicitudId: string,
    aprobar: boolean,
    motivoRechazo?: string,
  ) {
    const condominio = await this.condominioModel.findById(condominioId)
    if (!condominio) throw new NotFoundException('Condominio no encontrado')

    // Buscar el área que contiene la solicitud
    const area = condominio.areasComunes.find((areaComun) =>
      areaComun.solicitudes?.some((s) => s._id.toString() === solicitudId),
    )

    if (!area)
      throw new NotFoundException(
        'Área común no encontrada para esta solicitud',
      )

    if (!area.solicitudes || !Array.isArray(area.solicitudes)) {
      throw new NotFoundException('No hay solicitudes en esta área común')
    }

    // Buscar la solicitud actual
    const solicitud = area.solicitudes.find(
      (s) => s._id.toString() === solicitudId,
    )
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada')

    if (solicitud.estado !== 'pendiente') {
      throw new Error('Esta solicitud ya ha sido gestionada')
    }

    // Validar traslape si se intenta aprobar
    if (aprobar) {
      const inicioActual = new Date(solicitud.fechaInicio)
      const finActual = new Date(solicitud.fechaFin)

      const hayConflicto = area.solicitudes.some((s) => {
        if (s.estado !== 'aprobada') return false

        const inicioExistente = new Date(s.fechaInicio)
        const finExistente = new Date(s.fechaFin)

        // Reglas de traslape: A < B && B > A
        return inicioActual < finExistente && finActual > inicioExistente
      })

      if (hayConflicto) {
        throw new ConflictException(
          'Ya existe una solicitud aprobada para ese horario en esta área común',
        )
      }
    }

    solicitud.estado = aprobar ? 'aprobada' : 'rechazada'
    if (!aprobar && motivoRechazo) solicitud.motivoRechazo = motivoRechazo

    await condominio.save()
    return { message: `Solicitud ${aprobar ? 'aprobada' : 'rechazada'}` }
  }
}
