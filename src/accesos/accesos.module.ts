import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccesosService } from './accesos.service';
import { AccesosController } from './accesos.controller';
import { Acceso, AccesoSchema } from './acceso.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Acceso.name, schema: AccesoSchema }]),
  ],
  providers: [AccesosService],
  controllers: [AccesosController],
})
export class AccesosModule {}
