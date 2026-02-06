/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
      }
    }
  }

  @SubscribeMessage('register')
  register(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.onlineUsers.set(userId, client.id);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const saved = await this.chatService.sendMessage(body.senderId, body);
    const receiverSocket = this.onlineUsers.get(body.receiverId);
    if (receiverSocket) {
      this.server.to(receiverSocket).emit('receiveMessage', saved);
    }
  }

  @SubscribeMessage('callUser')
  callUser(
    @MessageBody() data: { to: string; signal: any; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const receiverSocket = this.onlineUsers.get(data.to);
    if (receiverSocket) {
      this.server
        .to(receiverSocket)
        .emit('incomingCall', { signal: data.signal, from: data.from });
    }
  }

  @SubscribeMessage('answerCall')
  answerCall(
    @MessageBody() data: { to: string; signal: any },
    @ConnectedSocket() client: Socket,
  ) {
    const callerSocket = this.onlineUsers.get(data.to);
    if (callerSocket) {
      this.server.to(callerSocket).emit('callAccepted', data.signal);
    }
  }
}
