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
import { EventosModule } from './apis/eventos/eventos.module';
import { PromocionesModule } from './apis/promociones/promociones.module';
import { EstadosMexicoModule } from './apis/estados_mexico/estados_mexico.module';
import { PaisesModule } from './apis/paises/paises.module';
import { CiudadesMexicoModule } from './apis/ciudades_mexico/ciudades_mexico.module';
import { EquiposModule } from './apis/equipos/equipos.module';
import { PecersModule } from './apis/pecers/pecers.module';
import { FolloersModule } from './apis/folloers/folloers.module';


@Module({
  imports: [PrismaModule, SmsModule, SecUsersModule, ActividadesModule, ZonasModule, EstablecimientosModule, LoginModule, EventosModule, PromocionesModule, EstadosMexicoModule, PaisesModule, CiudadesMexicoModule, EquiposModule, PecersModule, FolloersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
