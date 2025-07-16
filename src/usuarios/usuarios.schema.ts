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

  @Prop({ required: true, enum: ['propietario', 'residente'] })
  role: string

  @Prop({ required: true, min: 1 })
  numberOfResidents: number

  @Prop({ required: true })
  parkingSpot: string

  @Prop({ required: true })
  emergencyContactName: string

  @Prop({ required: true })
  emergencyContactPhone: string

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: string

  @Prop({ maxlength: 250 })
  notes?: string

  @Prop({ type: Types.ObjectId, ref: 'Condominio', required: true })
  condominioId: Types.ObjectId
}

export const UserSchema = SchemaFactory.createForClass(User)
