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

  @Prop({ required: true })
  unitNumber: string

  @Prop({ required: true, enum: ['propietario', 'guardia'] })
  role: string

  @Prop({ required: true, min: 1 })
  numberOfResidents: number

  @Prop({ required: true })
  emergencyContactName: string

  @Prop({ required: true })
  emergencyContactPhone: string

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'inactive' })
  status: string

  // Vehículo
  @Prop({ type: String, default: null })
  vehiclePlate?: string

  @Prop({ type: String, default: null })
  vehicleModel?: string

  @Prop({ type: Types.ObjectId, ref: 'Departamento', default: null })
  departamentoId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Condominio', default: null })
  condominioId?: Types.ObjectId
}

export const UserSchema = SchemaFactory.createForClass(User)
