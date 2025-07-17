import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Admin, AdminDocument } from '@/admins/admin.schemas'
import {
  CreateCondominioDto,
  UpdateCondominioInfoDto,
  UpdateCondominioStatusDto,
} from './dto/condominio.dto'
import { Condominio, CondominioDocument } from './condominio.schema'

@Injectable()
export class CondominiosService {
  constructor(
    @InjectModel(Condominio.name)
    private readonly condominioModel: Model<CondominioDocument>,
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async create(dto: CreateCondominioDto): Promise<Condominio> {
    // Verificar si ya existe un condominio con ese ID personalizado
    const exists = await this.condominioModel.findOne({ id: dto.id }).exec()
    if (exists) {
      throw new ConflictException('Ya existe un condominio con ese ID')
    }

    // Verificar si el admin existe
    const admin = await this.adminModel.findById(dto.adminId).exec()
    if (!admin) {
      throw new NotFoundException('Admin no encontrado')
    }

    // Función para generar departamentos para una torre
    function generarDepartamentos(
      torreIdentificador: string,
      cantidad: number,
    ) {
      return Array.from({ length: cantidad }, (_, i) => {
        const codigo = `${torreIdentificador.toUpperCase()}${String(i + 1).padStart(2, '0')}`
        return { codigo, nombre: `Departamento ${codigo}` }
      })
    }

    // Función para generar casas
    function generarCasas(casaIdentificador: string, cantidad: number) {
      return Array.from({ length: cantidad }, (_, i) => {
        const codigo = `${casaIdentificador.toUpperCase()}${String(i + 1).padStart(2, '0')}`
        return { codigo, nombre: `Casa ${codigo}` }
      })
    }

    // Construimos el objeto que guardaremos
    const condominioData: Partial<Condominio> = {
      id: dto.id,
      name: dto.name,
      address: dto.address,
      email: dto.email,
      phone: dto.phone,
      tipo: dto.tipo,
      adminId: admin._id,
      status: 'active',
      users: [],
    }

    if (dto.tipo === 'torres') {
      if (!dto.torres || dto.torres.length === 0) {
        throw new ConflictException(
          'Debe especificar al menos una torre con departamentos',
        )
      }
      condominioData.torres = dto.torres.map((torre) => ({
        identificador: torre.identificador.toUpperCase(),
        departamentos: torre.departamentos,
        departamentosDetalles: generarDepartamentos(
          torre.identificador,
          torre.departamentos,
        ),
      }))
    } else if (dto.tipo === 'casas') {
      if (!dto.casas || dto.casas.length === 0) {
        throw new ConflictException(
          'Debe especificar al menos un identificador de casas con cantidad',
        )
      }
      condominioData.casas = dto.casas.map((casa) => ({
        identificador: casa.identificador.toUpperCase(),
        cantidad: casa.cantidad,
        casasDetalles: generarCasas(casa.identificador, casa.cantidad),
      }))
    }

    // Crear y guardar el condominio
    const created = new this.condominioModel(condominioData)
    const saved = await created.save()

    // Actualizar el admin con el condominio creado
    await this.adminModel.findByIdAndUpdate(admin._id, {
      $push: { condominios: saved._id },
    })
    console.log(
      'Condominio a guardar:',
      JSON.stringify(condominioData, null, 2),
    )
    return saved
  }

  async findAll(): Promise<CondominioDocument[]> {
    return this.condominioModel
      .find()
      .populate('adminId', 'name email phone identification')
      .exec()
  }

  async findOneById(id: string): Promise<CondominioDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID inválido')
    const condominio = await this.condominioModel
      .findById(id)
      .populate('adminId', 'name email phone identification')
      .exec()
    if (!condominio) throw new NotFoundException('Condominio no encontrado')
    return condominio
  }

  async updateStatus(
    id: string,
    dto: UpdateCondominioStatusDto,
  ): Promise<CondominioDocument> {
    const condominio = await this.findOneById(id)
    condominio.status = dto.status
    return condominio.save()
  }

  async updateInfo(
    id: string,
    dto: UpdateCondominioInfoDto,
  ): Promise<CondominioDocument> {
    const condominio = await this.findOneById(id)
    if (dto.name) condominio.name = dto.name
    if (dto.address) condominio.address = dto.address
    if (dto.email) condominio.email = dto.email
    if (dto.phone) condominio.phone = dto.phone
    return condominio.save()
  }
}
