import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillRequest } from '../entity/request.entity';
import { User } from '../entity/user.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RedisModule } from 'src/redis/redis.module'; //Added

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillRequest, User]),
    RedisModule, //Added
  ],
  providers: [RequestsService],
  controllers: [RequestsController],
})
export class RequestsModule {}
