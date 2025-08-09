import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { AccesosService } from './accesos.service'
import { Acceso } from './acceso.schema'

@Controller('accesos')
export class AccesosController {
  constructor(private readonly accesosService: AccesosService) {}

  // Crear nuevo acceso
  @Post()
  async crear(@Body() data: Partial<Acceso>) {
    return this.accesosService.crearAcceso(data)
  }

  // Listar accesos por condominio
  @Get()
  async listar(@Query('condominioId') condominioId: string) {
    return this.accesosService.listarPorCondominio(condominioId)
  }

  @Get('conteo')
  async obtenerConteo(@Query('condominioId') condominioId: string) {
    if (!condominioId) {
      throw new BadRequestException('Falta condominioId')
    }
    return this.accesosService.contarAccesosYVehiculos(condominioId)
  }
  @Get('vehiculos')
  async obtenerVehiculos(@Query('condominioId') condominioId: string) {
    if (!condominioId) {
      throw new BadRequestException('Falta condominioId')
    }
    return this.accesosService.listarVehiculosActivos(condominioId)
  }

  // Registrar salida (solo horaSalida)
  @Patch(':id/salida')
  async registrarSalida(
    @Param('id') id: string,
    @Body('horaSalida') horaSalida: Date,
  ) {
    return this.accesosService.registrarSalida(id, horaSalida)
  }
}
