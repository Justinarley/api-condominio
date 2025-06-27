import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AdminDocument = Admin & Document

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true })
  address: string

  @Prop()
  identification?: string

  @Prop({ default: true })
  active: boolean

  @Prop({ default: 'admin' })
  role: string

  @Prop({ type: [String], default: [] })
  condominios: string[] // IDs de condominios si quieres relacionarlo luego
  _id: any
}

export const AdminSchema = SchemaFactory.createForClass(Admin)
