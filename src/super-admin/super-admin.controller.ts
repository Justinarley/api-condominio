import { Body, Controller, Post } from '@nestjs/common'
import { SuperAdminService } from './super-admin.service'
import {
  CreateSuperAdminDto,
} from './dto/create-super-admin.dto'

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  async create(@Body() dto: CreateSuperAdminDto) {
    return this.superAdminService.create(dto)
  }
}
