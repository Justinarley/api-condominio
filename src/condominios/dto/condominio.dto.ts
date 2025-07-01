import { IsEmail, IsNotEmpty, IsString, IsMongoId, Matches, IsOptional, IsIn } from 'class-validator'

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
