import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

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

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string
  
  @Prop({ default: 'admin' })
  role: string

  @Prop({ type: [Types.ObjectId], ref: 'Condominio', default: [] })
  condominios: Types.ObjectId[]

  _id: Types.ObjectId
}

export const AdminSchema = SchemaFactory.createForClass(Admin)
