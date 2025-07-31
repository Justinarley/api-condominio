import { Response } from 'express'
import generateReport from './report'

export interface DataToBuffer {
  data?: any[]
  other: {
    endDate?: Date | string
    startDate?: Date | string
    generationDate: Date | string
  }
}
export async function fileResponse({
  res,
  data,
  path,
  filename,
}: {
  res: Response
  data: DataToBuffer
  path: string
  filename: string
}) {
  const buffer = generateReport(data, path)

  const mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.setHeader('Content-Length', buffer.length.toString())
  res.setHeader('Content-Type', mimetype)
  res.end(buffer)
}
