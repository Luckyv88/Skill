/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Post, Body, Req, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private service: ChatService) {}

  @Post('send')
  send(@Req() req: any, @Body() body: SendMessageDto) {
    return this.service.sendMessage(req.user.userId, body);
  }

  @Get('history/:friendId')
  history(@Req() req: any, @Param('friendId') friendId: string) {
    return this.service.getChatHistory(req.user.userId, friendId);
  }

  @Get('friends')
  friends(@Req() req: any) {
    return this.service.getFriendsList(req.user.userId);
  }
}
