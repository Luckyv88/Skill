/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../entity/user.entity';
import { generateAvatar } from '../utils/avatar.util';
import { SignUpDto } from './dto/signup.dto';
import { loginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async signup(data: SignUpDto) {
    // Optimized existence check (select only id)
    const exists = await this.userRepo.findOne({
      where: [
        { email: data.email },
        { username: data.username },
        { phone: data.phone },
      ],
      select: ['id'], // Only fetch id
    });

    if (exists) {
      throw new BadRequestException('User already exists');
    }

    // Hash only once
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      profilepic: generateAvatar(data.username),
    });

    const savedUser = await this.userRepo.save(user);

    return this.generateToken(savedUser.id);
  }

  async login(data: loginDto) {
    //Fetch only required fields
    const user = await this.userRepo.findOne({
      where: { email: data.email },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id);
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '7d' },
    );
  }
}
