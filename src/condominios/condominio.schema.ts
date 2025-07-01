import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

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

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  adminId: Types.ObjectId
}

export const CondominioSchema = SchemaFactory.createForClass(Condominio)
