import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common'
import { CondominiosService } from './condominios.service'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { Roles } from '@/auth/decoradors/roles.decorator'
import {
  CreateCondominioDto,
  UpdateCondominioInfoDto,
  UpdateCondominioStatusDto,
} from './dto/condominio.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('condominios')
export class CondominiosController {
  constructor(private readonly condominiosService: CondominiosService) {}

  @Post()
  async create(@Body() dto: CreateCondominioDto) {
    return this.condominiosService.create(dto)
  }

  @Get()
  async findAll(@Query('condominioId') condominioId?: string) {
    return this.condominiosService.findAll(condominioId)
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.condominiosService.findOneById(id)
  }

  @Put(':id')
  async updateInfo(@Param('id') id: string, @Body() dto: UpdateCondominioInfoDto) {
    return this.condominiosService.updateInfo(id, dto)
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateCondominioStatusDto) {
    return this.condominiosService.updateStatus(id, dto)
  }

}
