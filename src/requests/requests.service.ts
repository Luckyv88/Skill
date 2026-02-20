/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { SkillRequest } from '../entity/request.entity';
import { User } from '../entity/user.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest)
    private reqRepo: Repository<SkillRequest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private redis: Redis, // Added
  ) {}

  async send(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send request to yourself');
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const existingRequest = await this.reqRepo.findOne({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
    });

    if (existingRequest) {
      throw new BadRequestException('Friend request already exists');
    }

    const request = this.reqRepo.create({
      sender,
      receiver,
    });

    const saved = await this.reqRepo.save(request);

    //  Clear cache after new request
    await this.redis.del(`requests:${senderId}`);
    await this.redis.del(`requests:${receiverId}`);
    await this.redis.del(`accepted:${senderId}`);
    await this.redis.del(`accepted:${receiverId}`);

    return saved;
  }

  async respond(id: string, status: 'ACCEPTED' | 'REJECTED') {
    await this.reqRepo.update(id, { status });

    // ❗ We don't know userId directly here,
    // so simplest safe way:
    await this.redis.flushdb(); // optional simple approach

    return { success: true };
  }

  async accepted(userId: string) {
    const cacheKey = `accepted:${userId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await this.reqRepo.find({
      where: [
        { sender: { id: userId }, status: 'ACCEPTED' },
        { receiver: { id: userId }, status: 'ACCEPTED' },
      ],
      relations: ['sender', 'receiver'],
    });

    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 120); // 2 min cache

    return data;
  }

  async findAll(userId: string) {
    const cacheKey = `requests:${userId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await this.reqRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver'],
    });

    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 60); // 1 min cache

    return data;
  }

  async removeFriend(userId: string, friendId: string) {
    await this.reqRepo.delete([
      { sender: { id: userId }, receiver: { id: friendId } },
      { sender: { id: friendId }, receiver: { id: userId } },
    ]);

    //  Clear cache
    await this.redis.del(`requests:${userId}`);
    await this.redis.del(`requests:${friendId}`);
    await this.redis.del(`accepted:${userId}`);
    await this.redis.del(`accepted:${friendId}`);

    return { success: true, message: 'Friend removed' };
  }
}
