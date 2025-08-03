// dto/departamento.dto.ts
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator'

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  codigo: string

  @IsString()
  @IsNotEmpty()
  nombre: string

  @IsString()
  @IsIn(['ocupado', 'disponible', 'mantenimiento'])
  estado: string

  @IsMongoId()
  @IsNotEmpty()
  condominio: string

  @IsString()
  @IsNotEmpty()
  grupo: string // Torre A, Casa 1, etc.

  @IsMongoId()
  @IsOptional()
  propietario?: string
}

export class UpdateDepartamentoDto {
  @IsString()
  @IsOptional()
  estado?: string

  @IsMongoId()
  @IsOptional()
  propietario?: string
}
