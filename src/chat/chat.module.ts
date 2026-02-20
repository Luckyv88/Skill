import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from '../entity/chat.entity';
import { User } from '../entity/user.entity';
import { SkillRequest } from '../entity/request.entity';
import { ChatGateway } from './chat.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, User, SkillRequest]),
    RedisModule,
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
