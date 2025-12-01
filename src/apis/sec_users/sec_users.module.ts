import { Module, forwardRef } from '@nestjs/common';
import { SecUsersService } from './sec_users.service';
import { SecUsersController } from './sec_users.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [forwardRef(() => NotificacionesModule)],
  controllers: [SecUsersController],
  providers: [SecUsersService],
  exports: [SecUsersService],
})
export class SecUsersModule {}
