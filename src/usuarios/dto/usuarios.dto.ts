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
} from 'class-validator'

export enum IdentificationType {
  CEDULA = 'cedula',
  PASAPORTE = 'pasaporte',
  RUC = 'ruc',
}

export enum UserRole {
  PROPIETARIO = 'propietario',
  RESIDENTE = 'residente',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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

  @IsString()
  @IsNotEmpty()
  unitNumber: string

  @IsEnum(UserRole)
  role: UserRole

  @IsNumber()
  @Min(1)
  numberOfResidents: number

  @IsString()
  @IsNotEmpty()
  parkingSpot: string

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

  @IsMongoId({ message: 'El ID del condominio debe ser un ObjectId válido' })
  condominioId: string
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
  @IsString()
  unitNumber?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfResidents?: number

  @IsOptional()
  @IsString()
  parkingSpot?: string

  @IsOptional()
  @IsString()
  emergencyContactName?: string

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string

  @IsOptional()
  @IsString()
  @MaxLength(250)
  notes?: string
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Min(6)
  password: string
}
