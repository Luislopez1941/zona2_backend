import { Module } from '@nestjs/common';
import { PaisesService } from './paises.service';
import { PaisesController } from './paises.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaisesController],
  providers: [PaisesService],
  exports: [PaisesService],
})
export class PaisesModule {}
