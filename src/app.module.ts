import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './common/services/sms.module';
import { SecUsersModule } from './apis/sec_users/sec_users.module';
import { ActividadesModule } from './apis/actividades/actividades.module';
import { ZonasModule } from './apis/zonas/zonas.module';
import { EstablecimientosModule } from './apis/establecimientos/establecimientos.module';
import { LoginModule } from './apis/auth/login/login.module';


@Module({
  imports: [PrismaModule, SmsModule, SecUsersModule, ActividadesModule, ZonasModule, EstablecimientosModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
