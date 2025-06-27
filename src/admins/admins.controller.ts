import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common'
import { AdminsService } from './admins.service'
import { CreateAdminDto } from './dto/admins.dto'

import { Roles } from '@/auth/decoradors/roles.decorator'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async create(@Body() dto: CreateAdminDto, @Req() req) {
    return this.adminsService.create(dto)
  }
}
