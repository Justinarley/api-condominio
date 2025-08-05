import { Type } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  Matches,
  IsMobilePhone,
  IsMongoId,
  ValidateIf,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'

export enum IdentificationType {
  CEDULA = 'cedula',
  PASAPORTE = 'pasaporte',
  RUC = 'ruc',
}

export enum UserRole {
  PROPIETARIO = 'propietario',
  GUARDIA = 'guardia',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class VehicleDto {
  @IsString()
  plate: string

  @IsString()
  model: string

  @IsString()
  color: string
}

export class CreateResidentUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @Min(6)
  password: string

  @IsString()
  @IsMobilePhone('es-EC', {}, { message: 'Número de teléfono inválido' })
  phone: string

  @IsEnum(IdentificationType)
  identificationType: IdentificationType

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,13}$/, { message: 'Tipo de identificación inválido' })
  identificationNumber: string

  @IsEnum(UserRole)
  role: UserRole

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfResidents: number

  @IsString()
  @IsNotEmpty()
  emergencyContactName: string

  @IsString()
  @IsNotEmpty()
  @IsMobilePhone(
    'es-EC',
    {},
    { message: 'Número de teléfono de emergencia inválido' },
  )
  emergencyContactPhone: string

  @IsEnum(UserStatus)
  status: UserStatus

  @IsOptional()
  @IsString()
  @MaxLength(250)
  notes?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VehicleDto)
  @ArrayMinSize(0)
  vehicles?: VehicleDto[]

  // Validación condicional: departamentoId requerido solo si rol es propietario
  @ValidateIf((o) => o.role === UserRole.PROPIETARIO)
  @IsMongoId({ message: 'El ID del departamento debe ser un ObjectId válido' })
  departamentoId?: string

  @ValidateIf((o) => o.role === UserRole.GUARDIA)
  @IsMongoId({ message: 'El ID del condominio debe ser un ObjectId válido' })
  condominioId?: string
}

export class UpdateInfoDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEnum(IdentificationType)
  identificationType?: IdentificationType

  @IsOptional()
  @IsString()
  @Matches(/^\d{8,13}$/, { message: 'Tipo de identificación inválido' })
  identificationNumber?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfResidents?: number

  @IsOptional()
  @IsString()
  emergencyContactName?: string

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VehicleDto)
  @ArrayMinSize(0)
  vehicles?: VehicleDto[]
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Min(6)
  password: string
}
