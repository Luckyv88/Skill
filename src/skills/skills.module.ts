import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from '../entity/skill.entity';
import { User } from '../entity/user.entity';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { RedisModule } from 'src/redis/redis.module'; // Added

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, User]),
    RedisModule, // Added
  ],
  providers: [SkillsService],
  controllers: [SkillsController],
})
export class SkillsModule {}
