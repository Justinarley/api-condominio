import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PagoAlicuotaDocument = PagoAlicuota & Document

@Schema({ timestamps: true })
export class PagoAlicuota {
  @Prop({ type: Types.ObjectId, ref: 'Departamento', required: true })
  departamento: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  pagadoPor: Types.ObjectId

  @Prop({ type: Date, required: true })
  fechaPago: Date

  @Prop({ type: Number, required: true })
  montoPagado: number

  @Prop({ type: String, required: true })
  mes: string

  @Prop({
    type: String,
    enum: ['efectivo', 'transferencia'],
    default: 'efectivo',
  })
  tipoPago: 'efectivo' | 'transferencia'

  @Prop({
    type: String,
    enum: ['pendiente', 'pagado', 'rechazado'],
    default: 'pendiente',
  })
  estado: 'pendiente' | 'pagado' | 'rechazado'
}

export const PagoAlicuotaSchema = SchemaFactory.createForClass(PagoAlicuota)
