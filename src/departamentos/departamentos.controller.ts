// departamentos.controller.ts
import { Controller, Post, Get, Param, Body, Put, UseGuards } from '@nestjs/common'
import { DepartamentosService } from './departamentos.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { CreateDepartamentoDto, UpdateDepartamentoDto } from './dto/departamento.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly service: DepartamentosService) {}

  @Post()
  async create(@Body() dto: CreateDepartamentoDto) {
    return this.service.create(dto)
  }

  @Get(':condominioId')
  async findByCondominio(@Param('condominioId') condominioId: string) {
    return this.service.findByCondominio(condominioId)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartamentoDto) {
    return this.service.update(id, dto)
  }
}
