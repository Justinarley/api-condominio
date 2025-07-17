import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema()
export class DepartamentoDetalle {
  @Prop({ required: true })
  codigo: string

  @Prop({ required: true })
  nombre: string
}
export const DepartamentoDetalleSchema = SchemaFactory.createForClass(DepartamentoDetalle)

@Schema()
export class Torre {
  @Prop({ required: true })
  identificador: string

  @Prop({ required: true })
  departamentos: number

  @Prop({ type: [DepartamentoDetalleSchema], default: [] })
  departamentosDetalles: DepartamentoDetalle[]
}
export const TorreSchema = SchemaFactory.createForClass(Torre)

@Schema()
export class CasaDetalle {
  @Prop({ required: true })
  codigo: string

  @Prop({ required: true })
  nombre: string
}
export const CasaDetalleSchema = SchemaFactory.createForClass(CasaDetalle)

@Schema()
export class Casa {
  @Prop({ required: true })
  identificador: string

  @Prop({ required: true })
  cantidad: number

  @Prop({ type: [CasaDetalleSchema], default: [] })
  casasDetalles: CasaDetalle[]
}
export const CasaSchema = SchemaFactory.createForClass(Casa)

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

  @Prop({ type: [TorreSchema], default: undefined })
  torres?: Torre[]

  @Prop({ type: [CasaSchema], default: undefined })
  casas?: Casa[]

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  adminId: Types.ObjectId

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  users: Types.ObjectId[]
}

export const CondominioSchema = SchemaFactory.createForClass(Condominio)
