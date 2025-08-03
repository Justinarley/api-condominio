import { Type } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsMongoId,
  Matches,
  IsOptional,
  IsIn,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator'

class AreaComunDto {
  @IsString()
  @IsNotEmpty()
  nombre: string

  @IsIn(['libre', 'ocupado'])
  estado: 'libre' | 'ocupado'

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsNumber()
  capacidad?: number
}

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

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TorreDto)
  @ArrayMinSize(1)
  torres?: TorreDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CasaDto)
  @ArrayMinSize(1)
  casas?: CasaDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaComunDto)
  areasComunes: AreaComunDto[]

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaComunDto)
  areasComunes?: AreaComunDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TorreDto)
  torres?: TorreDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CasaDto)
  casas?: CasaDto[]

}

export class UpdateCondominioStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['active', 'inactive'])
  status: string
}
