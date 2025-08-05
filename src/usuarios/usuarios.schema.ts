import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true, select: false })
  password: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true, enum: ['cedula', 'pasaporte', 'ruc'] })
  identificationType: string

  @Prop({ required: true, unique: true })
  identificationNumber: string

  @Prop({ required: true, enum: ['propietario', 'guardia'] })
  role: string

  @Prop({ min: 1 })
  numberOfResidents: number

  @Prop({ required: true })
  emergencyContactName: string

  @Prop({ required: true })
  emergencyContactPhone: string

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'inactive' })
  status: string

  // Vehículo
  @Prop({
    type: [
      {
        plate: { type: String },
        model: { type: String },
        color: { type: String },
      },
    ],
    default: [],
  })
  vehicles?: {
    plate: string
    model: string
    color: string
  }[]

  @Prop({ type: Types.ObjectId, ref: 'Departamento', default: null })
  departamentoId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Condominio', default: null })
  condominioId?: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'Pago', default: [] })
  pagos?: Types.ObjectId[]
}

export const UserSchema = SchemaFactory.createForClass(User)
