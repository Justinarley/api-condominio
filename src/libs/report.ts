import * as fs from 'fs'
import Debug from 'debug'
import { join } from 'path'
import * as XlsxTemplate from 'xlsx-template'

const debug = Debug('api:libs:report')

function generateBuffer(data: object, dirTemplate: string) {
  debug('generando buffer')
  const templateBuffer = fs.readFileSync(dirTemplate)
  const template = new XlsxTemplate(templateBuffer)
  template.substitute(1, data)
  return template.generate()
}

export default function generateReport(data: object, path: string) {
  debug('generando reporte excel')
  const dir = join(__dirname.replace('dist', ''), '../', path.replace('@', ''))
  return Buffer.from(generateBuffer(data, dir), 'binary')
}
