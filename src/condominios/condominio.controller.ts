// public/condominios.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PublicCondominiosService } from './condominio.service';


@Controller('condominio')
export class PublicCondominiosController {
  constructor(private readonly publicCondominiosService: PublicCondominiosService) {}

  @Get()
  async obtenerCondominiosConDepartamentos() {
    return this.publicCondominiosService.obtenerCondominiosConDepartamentos();
  }
}
