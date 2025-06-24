import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateSuperAdminDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}

export class LoginSuperAdminDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}