import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { AdminService } from './admin.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Nuevo endpoint: info de condominios asignados con departamentos
  @Get('condominios')
  async obtenerCondominiosConDepartamentos(@Req() req) {
    console.log('User desde token:', req.user)
    return this.adminService.obtenerCondominiosConDepartamentos(req.user.id)
  }

  @Get('usuarios-pendientes')
  async usuariosPendientes() {
    return this.adminService.obtenerUsuariosPendientes()
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
}
