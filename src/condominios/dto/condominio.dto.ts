import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsMongoId,
  Matches,
  IsOptional,
  IsIn,
  IsNumber,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class TorreDto {
  @IsString()
  @IsNotEmpty()
  identificador: string

  @IsNumber()
  @IsNotEmpty()
  departamentos: number
}

export class CasaDto {
  @IsString()
  @IsNotEmpty()
  identificador: string

  @IsNumber()
  @IsNotEmpty()
  cantidad: number
}

export class CreateCondominioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^CND-\d{3}$/, {
    message: 'El ID debe tener el formato CND-001, CND-002, etc.',
  })
  id: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsIn(['torres', 'casas'])
  tipo: 'torres' | 'casas'

  @ValidateIf((o) => o.tipo === 'torres')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TorreDto)
  torres?: TorreDto[]

  @ValidateIf((o) => o.tipo === 'casas')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CasaDto)
  casas?: CasaDto[]

  @IsMongoId()
  @IsNotEmpty()
  adminId: string
}

export class UpdateCondominioInfoDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class UpdateCondominioStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['active', 'inactive'])
  status: string
}
