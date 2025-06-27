import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator'

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  email: string

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
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsString()
  role?: string
}
