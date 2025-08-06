// schemas/departamento.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type DepartamentoDocument = Departamento & Document

@Schema({ timestamps: true })
export class Departamento {
  @Prop({ required: true })
  codigo: string // ej: A01, C02

  @Prop({ required: true })
  nombre: string // "Departamento A01"

  @Prop({
    type: String,
    enum: ['ocupado', 'disponible', 'mantenimiento'],
    default: 'disponible',
  })
  estado: 'ocupado' | 'disponible' | 'mantenimiento'

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  propietario: Types.ObjectId | null

  @Prop({ type: Types.ObjectId, ref: 'Condominio', required: true })
  condominio: Types.ObjectId

  @Prop({ type: String, required: true })
  grupo: string

  @Prop({ required: true, min: 0, max: 1 })
  alicuota?: number
}

export const DepartamentoSchema = SchemaFactory.createForClass(Departamento)
