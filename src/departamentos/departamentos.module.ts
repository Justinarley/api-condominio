import { Module } from '@nestjs/common'
import { DepartamentosService } from './departamentos.service'
import { DepartamentosController } from './departamentos.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Departamento, DepartamentoSchema } from './departamento.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Departamento.name, schema: DepartamentoSchema },
    ]),
  ],
  providers: [DepartamentosService],
  controllers: [DepartamentosController],
  exports: [DepartamentosService, MongooseModule],
})
export class DepartamentosModule {}
