/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../entity/user.entity';
import { generateAvatar } from '../utils/avatar.util';
import { SignUpDto } from './dto/signup.dto';
import { loginDto } from './dto/login.dto';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async signup(data: SignUpDto) {
    const exists = await this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email: data.email })
      .orWhere('user.username = :username', { username: data.username })
      .orWhere('user.phone = :phone', { phone: data.phone })
      .getOne();

    if (exists) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      profilepic: generateAvatar(data.username),
    });

    await this.userRepo.save(user);

    //  Clear possible old cache
    await this.redis.del(`user:email:${data.email}`);

    return this.generateToken(user.id);
  }

  async login(data: loginDto) {
    let user: User | null = null;

    //  Use Redis Hash instead of full object caching
    const cached = await this.redis.hgetall(`user:email:${data.email}`);

    if (Object.keys(cached).length > 0) {
      user = {
        id: cached.id,
        email: cached.email,
        username: cached.username,
        phone: cached.phone,
        password: cached.password,
        fullname: cached.fullname,
        profilepic: cached.profilepic,
        createdAt: new Date(cached.createdAt),
      } as User;
    } else {
      user = await this.userRepo
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email: data.email })
        .getOne();

      if (user) {
        await this.redis.hset(`user:email:${data.email}`, {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          password: user.password,
          fullname: user.fullname,
          profilepic: user.profilepic,
          createdAt: user.createdAt.toISOString(),
        });

        await this.redis.expire(`user:email:${data.email}`, 3600);
      }
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '7d' },
    );

    // Store active token in Redis (optional blacklist system ready)
    this.redis.set(`active:token:${userId}`, token, 'EX', 604800);

    return token;
  }
}
