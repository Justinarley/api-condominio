import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsIn,
  IsMongoId,
  IsDateString,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator'

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsNotEmpty()
  @IsString()
  address: string

  @IsOptional()
  @IsString()
  identification?: string

  @IsOptional()
  @IsString()
  role?: string
}
export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['active', 'inactive'])
  status: string
}
export class UpdateInfoDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string
}

export class CrearSolicitudDto {
  @IsMongoId()
  @IsNotEmpty()
  condominioId: string

  @IsNotEmpty()
  nombreArea: string

  @IsDateString()
  fechaInicio: Date

  @IsDateString()
  fechaFin: Date
}

export class AsignarAlicuotaGrupoDto {
  @IsArray()
  @IsMongoId({ each: true })
  departamentos: string[]

  @IsNumber()
  @Min(0)
  @Max(1)
  alicuota: number
}

export class CrearGastoMensualDto {
  @IsNotEmpty()
  @IsString()
  mes: string

  @IsNotEmpty()
  @IsNumber()
  montoTotal: number

  @IsOptional()
  @IsString()
  descripcion?: string
}