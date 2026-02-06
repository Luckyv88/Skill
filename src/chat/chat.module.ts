import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from '../entity/chat.entity';
import { User } from '../entity/user.entity';
import { SkillRequest } from '../entity/request.entity';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, User, SkillRequest])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
