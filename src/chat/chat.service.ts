import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entity/chat.entity';
import { User } from '../entity/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { SkillRequest } from '../entity/request.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private chatRepo: Repository<ChatMessage>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(SkillRequest) private reqRepo: Repository<SkillRequest>,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({
      where: { id: dto.receiverId },
    });

    if (!sender) throw new Error('Sender not found');
    if (!receiver) throw new Error('Receiver not found');

    const accepted = await this.reqRepo.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: dto.receiverId },
          status: 'ACCEPTED',
        },
        {
          sender: { id: dto.receiverId },
          receiver: { id: senderId },
          status: 'ACCEPTED',
        },
      ],
    });

    if (!accepted) throw new Error('You are not connected with this user');

    const chat = this.chatRepo.create({
      sender: sender,
      receiver: receiver,
      message: dto.message,
      fileUrl: dto.fileUrl,
    });

    return this.chatRepo.save(chat);
  }

  async getChatHistory(userId: string, friendId: string) {
    return this.chatRepo.find({
      where: [
        { sender: { id: userId }, receiver: { id: friendId } },
        { sender: { id: friendId }, receiver: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getFriendsList(userId: string) {
    const acceptedRequests = await this.reqRepo.find({
      where: [
        { sender: { id: userId }, status: 'ACCEPTED' },
        { receiver: { id: userId }, status: 'ACCEPTED' },
      ],
      relations: ['sender', 'receiver'],
    });

    const friends = acceptedRequests.map((req) =>
      req.sender.id === userId ? req.receiver : req.sender,
    );

    // Remove duplicates
    const unique = friends.filter(
      (v, i, a) => a.findIndex((u) => u.id === v.id) === i,
    );

    return unique;
  }
}
