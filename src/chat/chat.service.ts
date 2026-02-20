/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
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
    @Inject('REDIS_CLIENT') private redis: Redis,
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
      sender,
      receiver,
      message: dto.message,
      fileUrl: dto.fileUrl,
    });

    const saved = await this.chatRepo.save(chat);

    // 🔥 Clear Chat Cache After New Message
    await this.redis.del(`chat:${senderId}:${dto.receiverId}`);
    await this.redis.del(`chat:${dto.receiverId}:${senderId}`);

    return saved;
  }

  async getChatHistory(userId: string, friendId: string) {
    const cacheKey = `chat:${userId}:${friendId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const accepted = await this.reqRepo.findOne({
      where: [
        {
          sender: { id: userId },
          receiver: { id: friendId },
          status: 'ACCEPTED',
        },
        {
          sender: { id: friendId },
          receiver: { id: userId },
          status: 'ACCEPTED',
        },
      ],
    });

    if (!accepted) throw new Error('You are not connected with this user');

    const messages = await this.chatRepo.find({
      where: [
        { sender: { id: userId }, receiver: { id: friendId } },
        { sender: { id: friendId }, receiver: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });

    await this.redis.set(cacheKey, JSON.stringify(messages), 'EX', 60);

    return messages;
  }

  async getFriendsList(userId: string) {
    const cacheKey = `friends:${userId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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

    const unique = friends.filter(
      (v, i, a) => a.findIndex((u) => u.id === v.id) === i,
    );

    await this.redis.set(cacheKey, JSON.stringify(unique), 'EX', 120);

    return unique;
  }
}
