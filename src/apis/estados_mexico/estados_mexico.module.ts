import { Module } from '@nestjs/common';
import { EstadosMexicoService } from './estados_mexico.service';
import { EstadosMexicoController } from './estados_mexico.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstadosMexicoController],
  providers: [EstadosMexicoService],
  exports: [EstadosMexicoService],
})
export class EstadosMexicoModule {}
