import { Module } from '@nestjs/common';
import { CiudadesMexicoService } from './ciudades_mexico.service';
import { CiudadesMexicoController } from './ciudades_mexico.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CiudadesMexicoController],
  providers: [CiudadesMexicoService],
  exports: [CiudadesMexicoService],
})
export class CiudadesMexicoModule {}
