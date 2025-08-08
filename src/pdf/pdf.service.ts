import {
  PagoAlicuota,
  PagoAlicuotaDocument,
} from '@/pago-alicuota/pago-alicuota.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import * as PDFDocument from 'pdfkit'

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

@Injectable()
export class PdfService {
  constructor(
    @InjectModel(PagoAlicuota.name)
    private pagoAlicuotaModel: Model<PagoAlicuotaDocument>,
  ) {}

  async generarReciboDesdePago(idPagoAlicuota: string): Promise<Buffer | null> {
    const [pago] = await this.pagoAlicuotaModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(idPagoAlicuota),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'pagadoPor',
          foreignField: '_id',
          as: 'propietario',
        },
      },
      { $unwind: '$propietario' },
      {
        $lookup: {
          from: 'departamentos',
          localField: 'departamento',
          foreignField: '_id',
          as: 'departamento',
        },
      },
      { $unwind: '$departamento' },
      {
        $lookup: {
          from: 'condominios',
          localField: 'departamento.condominio',
          foreignField: '_id',
          as: 'condominio',
        },
      },
      { $unwind: '$condominio' },
      {
        $lookup: {
          from: 'admins',
          localField: 'condominio.adminId',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },
      {
        $project: {
          fechaPago: 1,
          montoPagado: 1,
          mes: 1,
          tipoPago: 1,
          propietario: {
            name: '$propietario.name',
            identificationType: '$propietario.identificationType',
            identificationNumber: '$propietario.identificationNumber',
          },
          departamento: {
            nombre: '$departamento.nombre',
          },
          condominio: {
            _id: '$condominio._id',
            name: '$condominio.name',
            address: '$condominio.address',
          },
          admin: {
            name: '$admin.name',
          },
        },
      },
    ])

    console.log('Resultado de agregación:', JSON.stringify(pago, null, 2))

    console.log('Pago obtenido:', pago)

    // Secuencial por condominio
    const totalRecibosCondominio = await this.pagoAlicuotaModel.countDocuments({
      'departamento.condominio': pago.condominio._id,
    })

    const codigoCondominio = pago.condominio.name
      .replace(/\s+/g, '')
      .substring(0, 3)
      .toUpperCase()

    const idCorto = new Types.ObjectId(idPagoAlicuota)
      .toString()
      .slice(-6)
      .toUpperCase()

    const numeroRecibo = `${codigoCondominio}-${String(totalRecibosCondominio + 1).padStart(4, '0')}-${idCorto}`

    // Crear PDF y esperar hasta que termine
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Uint8Array[] = []

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', (err) => reject(err))

      doc
        .fontSize(16)
        .text(pago.condominio.name, { align: 'center' })
        .moveDown(0.5)

      doc.fontSize(20).text('RECIBO DE PAGO DE ALÍCUOTA', { align: 'center' })

      doc
        .fontSize(12)
        .text(`Recibo N°: ${numeroRecibo}`, { align: 'center' })
        .moveDown()

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown()

      doc
        .fontSize(12)
        .text(`Nombre del propietario: ${pago.propietario.name}`)
        .text(
          `Identificación: ${pago.propietario.identificationType.toUpperCase()}-${pago.propietario.identificationNumber}`,
        )
        .text(`Departamento o Casa: ${pago.departamento.nombre}`)
        .text(
          `Fecha del pago: ${new Date(pago.fechaPago).toLocaleDateString('es-VE')}`,
        )
        .text(`Mes correspondiente: ${pago.mes}`)
        .moveDown()
        .text(`Monto pagado: $${pago.montoPagado.toFixed(2)}`)
        .text(`Método de pago: ${capitalize(pago.tipoPago)}`)
        .moveDown()
        .text(`Emitido por: ${pago.admin.name}`)
        .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`)
        .moveDown()

      doc.fontSize(10).text('Gracias por su pago.', { align: 'center' })

      doc.end()
    })
  }
}
