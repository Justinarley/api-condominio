import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreatePagoDto {
  @IsNotEmpty()
  @IsMongoId()
  departamento: string

  @IsNotEmpty()
  @IsMongoId()
  pagadoPor: string

  @IsNotEmpty()
  @IsNumber()
  montoPagado: number

  @IsNotEmpty()
  @IsString()
  mes: string
}
