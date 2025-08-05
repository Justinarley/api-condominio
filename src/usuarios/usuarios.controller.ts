import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import {
  CreateResidentUserDto,
  UpdateInfoDto,
  UpdatePasswordDto,
} from './dto/usuarios.dto'
import { CrearSolicitudDto, UpdateStatusDto } from '@/admins/dto/admins.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from '@/auth/decoradors/roles.decorator'

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('propietario')
  @Get('dashboard-propietario')
  async getDashboard(@Req() req) {
    return this.usuariosService.getDashboardData(req.user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('propietario')
  @Get('areas-comunes')
  async obtenerAreasComunes(@Req() req) {
    return this.usuariosService.obtenerAreasComunes(req.user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('propietario')
  @Post('reservar-area')
  async reservarArea(@Req() req, @Body() dto: CrearSolicitudDto) {
    return this.usuariosService.solicitarReserva(dto, req.user.id)
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.usuariosService.findOneById(id)
  }

  @Put(':id')
  async updateInfo(@Param('id') id: string, @Body() dto: UpdateInfoDto) {
    return this.usuariosService.updateInfo(id, dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usuariosService.updatePassword(id, dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.usuariosService.updateStatus(id, dto)
  }
}
