/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: ['https://skill-swap-o8x6.onrender.com', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    @Inject('REDIS_CLIENT') private redis: Redis, // Added
  ) {}

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.redis.del(`online:${userId}`);
      this.server.emit('updateStatus', { userId, status: 'offline' });
    }
  }

  @SubscribeMessage('join')
  async join(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId);
    client.data.userId = userId;

    await this.redis.set(`online:${userId}`, client.id);

    this.server.emit('updateStatus', { userId, status: 'online' });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;

    const saved = await this.chatService.sendMessage(senderId, body);

    const receiverSocket = await this.redis.get(`online:${body.receiverId}`);

    if (receiverSocket) {
      this.server.to(receiverSocket).emit('receiveMessage', saved);
    }

    this.server.to(client.id).emit('receiveMessage', saved);
  }

  @SubscribeMessage('callUser')
  async callUser(
    @MessageBody()
    data: {
      to: string;
      signalData: any;
      from: string;
      callType: string;
    },
  ) {
    const toSocket = await this.redis.get(`online:${data.to}`);

    if (toSocket) {
      this.server.to(toSocket).emit('incomingCall', {
        from: data.from,
        signalData: data.signalData,
        callType: data.callType,
      });

      this.server.emit('updateStatus', { userId: data.to, status: 'ringing' });
    }
  }

  @SubscribeMessage('acceptCall')
  async acceptCall(@MessageBody() data: { to: string; signalData: any }) {
    const toSocket = await this.redis.get(`online:${data.to}`);

    if (toSocket) {
      this.server
        .to(toSocket)
        .emit('callAccepted', { signalData: data.signalData });

      this.server.emit('updateStatus', { userId: data.to, status: 'online' });
    }
  }

  @SubscribeMessage('endCall')
  async endCall(@MessageBody() data: { to: string }) {
    const toSocket = await this.redis.get(`online:${data.to}`);

    if (toSocket) {
      this.server.to(toSocket).emit('callEnded');
      this.server.emit('updateStatus', { userId: data.to, status: 'online' });
    }
  }
}
