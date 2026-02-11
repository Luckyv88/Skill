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
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Adjust as needed
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map();
  private usersInCall: Set<string> = new Set();

  constructor(private chatService: ChatService) {}

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
    client.data.userId = userId; //attach user to socket
    console.log('User registered:', userId);
  }

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
    console.log('Online users:', this.onlineUsers);

    this.server.to(client.id).emit('receiveMessage', saved);
  }

  //  Call user (video/audio signaling)
  @SubscribeMessage('callUser')
  callUser(
    @MessageBody() data: { to: string; signal: any },
    @ConnectedSocket() client: Socket,
  ) {
    const callerId = client.data.userId;
    const receiverSocket = this.onlineUsers.get(data.to);

    // If receiver already in call
    if (this.usersInCall.has(data.to)) {
      this.server.to(client.id).emit('userBusy');
      return;
    }

    if (receiverSocket) {
      // mark both as in call
      this.usersInCall.add(callerId);
      this.usersInCall.add(data.to);

      this.server.to(receiverSocket).emit('incomingCall', {
        signal: data.signal,
        from: callerId,
      });
    }
  }

  @SubscribeMessage('answerCall')
  answerCall(
    @MessageBody() data: { to: string; signal: any },
    @ConnectedSocket() client: Socket,
  ) {
    const callerSocket = this.onlineUsers.get(data.to);

    if (callerSocket) {
      this.server.to(callerSocket).emit('callAccepted', {
        signal: data.signal,
        from: client.data.userId,
      });
    }
  }

  @SubscribeMessage('rejectCall')
  rejectCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const callerSocket = this.onlineUsers.get(data.to);

    if (callerSocket) {
      this.server.to(callerSocket).emit('callRejected');
    }

    this.usersInCall.delete(data.to);
    this.usersInCall.delete(client.data.userId);
  }
  @SubscribeMessage('endCall')
  endCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const otherSocket = this.onlineUsers.get(data.to);

    if (otherSocket) {
      this.server.to(otherSocket).emit('callEnded');
    }

    this.usersInCall.delete(data.to);
    this.usersInCall.delete(client.data.userId);
  }
}
