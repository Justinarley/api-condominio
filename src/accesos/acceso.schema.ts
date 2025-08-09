import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AccesoDocument = Acceso & Document

@Schema({ timestamps: true })
export class Acceso {
  @Prop({ required: true, enum: ['VISITA', 'SERVICIO'] })
  tipo: 'VISITA' | 'SERVICIO'

  @Prop({ required: true, trim: true })
  nombrePersona: string

  @Prop({ type: Types.ObjectId, ref: 'Departamento', required: true })
  departamento: Types.ObjectId

  @Prop({
    type: {
      tipo: {
        type: String,
        enum: ['CEDULA', 'RUC', 'PASAPORTE'],
        required: true
      },
      numero: {
        type: String,
        required: true,
        trim: true
      }
    },
    required: true
  })
  identificacion: {
    tipo: 'CEDULA' | 'RUC' | 'PASAPORTE'
    numero: string
  }

  @Prop({
    type: {
      placa: { type: String, trim: true },
      color: { type: String, trim: true },
      modelo: { type: String, trim: true }
    },
    required: false
  })
  vehiculo?: {
    placa?: string
    color?: string
    modelo?: string
  }

  @Prop({ trim: true })
  descripcionServicio?: string

  @Prop({ type: Date, default: Date.now, required: true })
  horaEntrada: Date

  @Prop({ type: Date })
  horaSalida?: Date

  @Prop({ type: Types.ObjectId, ref: 'Condominio', required: true })
  condominio: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  guardia: Types.ObjectId
}

export const AccesoSchema = SchemaFactory.createForClass(Acceso)
