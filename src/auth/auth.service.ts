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
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async signup(data: SignUpDto) {
    const exists = await this.userRepo.findOne({
      where: [
        { email: data.email },
        { username: data.username },
        { phone: data.phone },
      ],
    });

    if (exists) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      profilepic: generateAvatar(data.username),
    });

    await this.userRepo.save(user);

    return this.generateToken(user.id);
  }

  async login(data: loginDto) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    // Use 'sub' standard claim
    const token = jwt.sign(
      { sub: userId }, // changed from { userId }
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '7d' },
    );
    return token;
  }
}
