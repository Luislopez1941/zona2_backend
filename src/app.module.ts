import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SecUsersModule } from './apis/sec_users/sec_users.module';
import { ActividadesModule } from './apis/actividades/actividades.module';
import { ZonasModule } from './apis/zonas/zonas.module';


@Module({
  imports: [PrismaModule, SecUsersModule, ActividadesModule, ZonasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
