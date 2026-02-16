/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    origin: ['http://localhost:3000', 'https://skill-swap-o8x6.onrender.com'], // same as your initSocket
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map(); // userId -> socket.id

  constructor(private chatService: ChatService) {}

  handleDisconnect(client: Socket) {
    console.log('Socket disconnected:', client.id);
    const disconnectedUser = [...this.onlineUsers.entries()].find(
      ([_, socketId]) => socketId === client.id,
    );
    if (disconnectedUser) {
      const [userId] = disconnectedUser;
      this.onlineUsers.delete(userId);
      this.server.emit('updateStatus', { userId, status: 'offline' });
    }
  }

  // ------------------- User Registration & Presence -------------------
  @SubscribeMessage('join')
  join(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId);
    client.data.userId = userId;
    this.onlineUsers.set(userId, client.id);
    console.log(`User ${userId} joined room`);

    // Broadcast online status
    this.server.emit('updateStatus', { userId, status: 'online' });
  }

  // ------------------- Chat Messaging -------------------
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;

    const saved = await this.chatService.sendMessage(senderId, body);

    const receiverSocket = this.onlineUsers.get(body.receiverId);

    if (receiverSocket) {
      this.server.to(receiverSocket).emit('receiveMessage', saved);
    }

    this.server.to(client.id).emit('receiveMessage', saved);
    console.log('Online users:', this.onlineUsers);
  }

  // ------------------- Call/Video Signaling -------------------
  @SubscribeMessage('callUser')
  callUser(
    @MessageBody()
    data: { to: string; signalData: any; from: string; callType: string },
    @ConnectedSocket() client: Socket,
  ) {
    const toSocket = this.onlineUsers.get(data.to);
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
  acceptCall(
    @MessageBody() data: { to: string; signalData: any },
    @ConnectedSocket() client: Socket,
  ) {
    const toSocket = this.onlineUsers.get(data.to);
    if (toSocket) {
      this.server
        .to(toSocket)
        .emit('callAccepted', { signalData: data.signalData });
      this.server.emit('updateStatus', { userId: data.to, status: 'online' });
    }
  }

  @SubscribeMessage('endCall')
  endCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const toSocket = this.onlineUsers.get(data.to);
    if (toSocket) {
      this.server.to(toSocket).emit('callEnded');
      this.server.emit('updateStatus', { userId: data.to, status: 'online' });
    }
  }
}
