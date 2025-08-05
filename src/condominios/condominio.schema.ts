import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ _id: true })
export class SolicitudReserva {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId

  @Prop({ required: true })
  fechaInicio: Date

  @Prop({ required: true })
  fechaFin: Date

  @Prop({ enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' })
  estado: 'pendiente' | 'aprobada' | 'rechazada'

  @Prop()
  motivoRechazo?: string
}
const SolicitudReservaSchema = SchemaFactory.createForClass(SolicitudReserva)

@Schema()
export class AreaComun {
  @Prop({ required: true })
  nombre: string

  @Prop({ required: true, enum: ['libre', 'ocupado'], default: 'libre' })
  estado: 'libre' | 'ocupado'

  @Prop()
  descripcion?: string

  @Prop()
  capacidad?: number

  @Prop({ type: [SolicitudReservaSchema], default: [] })
  solicitudes?: SolicitudReserva[]
}
export const AreaComunSchema = SchemaFactory.createForClass(AreaComun)

export type CondominioDocument = Condominio & Document

@Schema({ timestamps: true })
export class Condominio {
  @Prop({ unique: true, required: true })
  id: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true, enum: ['torres', 'casas'] })
  tipo: 'torres' | 'casas'

  @Prop({ type: [AreaComunSchema], default: [] })
  areasComunes: AreaComun[]

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string

  @Prop({ type: [Types.ObjectId], ref: 'Departamento', default: [] })
  departamentos: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  adminId: Types.ObjectId
}

export const CondominioSchema = SchemaFactory.createForClass(Condominio)
