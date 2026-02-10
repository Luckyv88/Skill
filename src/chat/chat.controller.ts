/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
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
