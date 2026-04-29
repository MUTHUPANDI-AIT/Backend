import { Module } from '@nestjs/common';
import { OopsController } from './oops.controller';
import { OopsService } from './oops.service';

@Module({
  controllers: [OopsController],
  providers: [OopsService],
})
export class OopsModule {}