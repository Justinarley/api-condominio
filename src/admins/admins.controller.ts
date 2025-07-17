import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { AdminsService } from './admins.service'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { CreateAdminDto, UpdateInfoDto, UpdatePasswordDto, UpdateStatusDto } from './dto/admins.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto)
  }

  @Get()
  async findAll() {
    return this.adminsService.findAll()
  }

  @Get('actives')
async findActivos() {
  return this.adminsService.findActivos()
}

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.adminsService.findOneById(id)
  }

  @Put(':id')
  async updateInfo(@Param('id') id: string, @Body() dto: UpdateInfoDto) {
    return this.adminsService.updateInfo(id, dto)
  }

  @Put(':id/password')
  async updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.adminsService.updatePassword(id, dto)
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminsService.updateStatus(id, dto)
  }

}
