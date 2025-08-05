import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Put,
  Query,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { AdminService } from './admin.service'
import { UpdateInfoDto } from './dto/admins.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Nuevo endpoint: info de condominios asignados con departamentos
  @Get('condominios')
  async obtenerCondominiosConDepartamentos(
    @Req() req,
    @Query('condominioId') condominioId?: string,
  ) {
    console.log('User desde token:', req.user)
    return this.adminService.obtenerCondominiosConDepartamentos(
      req.user.id,
      condominioId,
    )
  }

  @Get('usuarios-pendientes')
  async usuariosPendientes(
    @Req() req,
    @Query('condominioId') condominioId?: string,
  ) {
    return this.adminService.obtenerUsuariosPorRolYEstado(
      req.user.id,
      undefined,
      'inactive',
      condominioId,
    )
  }

  @Get('propietarios-activos')
  async obtenerPropietariosActivos(
    @Req() req,
    @Query('condominioId') condominioId?: string,
  ) {
    return this.adminService.obtenerUsuariosPorRolYEstado(
      req.user.id,
      'propietario',
      'active',
      condominioId,
    )
  }

  @Get('guardias-activos')
  async obtenerGuardiasActivos(
    @Req() req,
    @Query('condominioId') condominioId?: string,
  ) {
    return this.adminService.obtenerUsuariosPorRolYEstado(
      req.user.id,
      'guardia',
      'active',
      condominioId,
    )
  }

  @Put('usuarios/:id/aprobar')
  async aprobarORechazarUsuario(
    @Req() req,
    @Param('id') userId: string,
    @Body() body: { aprobar: boolean },
  ) {
    return this.adminService.aprobarUsuario(
      req.user.userId,
      userId,
      body.aprobar,
    )
  }

  @Get('guardias-count')
  async contarGuardias(@Req() req) {
    return this.adminService.contarGuardiasPorEstado(req.user.id)
  }

  @Get('solicitudes-reserva')
  async obtenerSolicitudesReserva(
    @Req() req,
    @Query('condominioId') condominioId?: string,
  ) {
    return this.adminService.obtenerSolicitudesReserva(
      req.user.id,
      condominioId,
    )
  }

  @Put('solicitudes-reserva/:condominioId/:solicitudId')
  async actualizarEstadoSolicitud(
    @Param('condominioId') condominioId: string,
    @Param('solicitudId') solicitudId: string,
    @Body() dto: { aprobar: boolean; motivoRechazo?: string },
  ) {
    return this.adminService.actualizarEstadoSolicitudReserva(
      condominioId,
      solicitudId,
      dto.aprobar,
      dto.motivoRechazo,
    )
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.adminService.findOneById(id)
  }

  @Put(':id')
  async updateInfo(@Param('id') id: string, @Body() dto: UpdateInfoDto) {
    return this.adminService.updateInfos(id, dto)
  }
}
