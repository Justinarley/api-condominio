import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import {
  CreateResidentUserDto,
  UpdateInfoDto,
  UpdatePasswordDto,
} from './dto/usuarios.dto'
import { UpdateStatusDto } from '@/admins/dto/admins.dto'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(@Body() dto: CreateResidentUserDto) {
    return this.usuariosService.create(dto)
  }

  @Get()
  async findAll() {
    return this.usuariosService.findAll()
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.usuariosService.findOneById(id)
  }

  @Put(':id')
  async updateInfo(@Param('id') id: string, @Body() dto: UpdateInfoDto) {
    return this.usuariosService.updateInfo(id, dto)
  }

  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usuariosService.updatePassword(id, dto)
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.usuariosService.updateStatus(id, dto)
  }
}
