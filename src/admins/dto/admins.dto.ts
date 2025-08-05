import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsIn,
  IsMongoId,
  IsDateString,
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
