import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, ObjectId } from 'mongoose'

@Schema({ timestamps: true })
export class SuperAdmin {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ default: 'super_admin' })
  role: string
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin)

export interface SuperAdminDocument extends Document {
  _id: ObjectId
  email: string
  password: string
  role: string
}
