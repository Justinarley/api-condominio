import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { PagoAlicuotaService } from './pago-alicuota.service'
import { CreatePagoDto } from './dto/pago-alicuota'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'

@Controller('pagos-alicuota')
export class PagoAlicuotaController {
  constructor(private readonly pagoService: PagoAlicuotaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('propietario')
  @Post()
  async create(@Body() dto: CreatePagoDto) {
    const yaExiste = await this.pagoService.findPagoPorMes(
      dto.pagadoPor,
      dto.departamento,
      dto.mes,
    )

    if (yaExiste) {
      throw new BadRequestException(
        'Ya existe un pago para este mes con estado: ' + yaExiste.estado,
      )
    }

    // 2. Si no existe, lo crea
    return this.pagoService.create(dto)
  }

  @Get('departamento')
  findByDepartamento(@Query('id') id: string) {
    return this.pagoService.findByDepartamento(id)
  }

  @Get('mes')
  findByMes(@Query('mes') mes: string) {
    return this.pagoService.findByMes(mes)
  }

  @Get('departamento/estado')
  findByDepartamentoYEstado(
    @Query('departamentoId') departamentoId: string,
    @Query('estado') estado?: string,
  ) {
    return this.pagoService.findByDepartamentoYEstado(departamentoId, estado)
  }

  @Get('usuario')
  findByUsuario(@Query('usuarioId') usuarioId: string) {
    return this.pagoService.findByUsuario(usuarioId)
  }
  
}
