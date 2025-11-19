import { Module } from '@nestjs/common';
import { SecUsersService } from './sec_users.service';
import { SecUsersController } from './sec_users.controller';

@Module({
  controllers: [SecUsersController],
  providers: [SecUsersService],
})
export class SecUsersModule {}
