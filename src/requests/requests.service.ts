// eslint-disable-next-line prettier/prettier
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRequest } from '../entity/request.entity';
import { User } from '../entity/user.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SkillRequest) private reqRepo: Repository<SkillRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  //  Send a request
  async send(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send request to yourself');
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    // SCHECK IF REQUEST ALREADY EXISTS (both directions)
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

    return this.reqRepo.save(request);
  }

  //  Respond to a request
  async respond(id: string, status: 'ACCEPTED' | 'REJECTED') {
    await this.reqRepo.update(id, { status });
    return { success: true };
  }

  // Get accepted requests for a user
  async accepted(userId: string) {
    return this.reqRepo.find({
      where: [
        { sender: { id: userId }, status: 'ACCEPTED' },
        { receiver: { id: userId }, status: 'ACCEPTED' },
      ],
      relations: ['sender', 'receiver'],
    });
  }

  // Get all requests for logged-in user (sent + received)
  async findAll(userId: string) {
    return this.reqRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver'],
    });
  }

  // Remove friend
  async removeFriend(userId: string, friendId: string) {
    await this.reqRepo.delete([
      { sender: { id: userId }, receiver: { id: friendId } },
      { sender: { id: friendId }, receiver: { id: userId } },
    ]);

    return { success: true, message: 'Friend removed' };
  }
}
