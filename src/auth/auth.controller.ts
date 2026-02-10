/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { loginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDto, @Res() res: Response) {
    const token = await this.authService.signup(body);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'none', // for cross-site requests
      secure: true, // must be HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ success: true });
  }

  @Post('login')
  async login(@Body() body: loginDto, @Res() res: Response) {
    const token = await this.authService.login(body);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.json({ success: true });
  }

  @Get('me')
  me(@Req() req: Request) {
    const token = req.cookies?.jwt;

    if (!token) return null;

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string,
      ) as any;

      return { id: decoded.sub };
    } catch {
      return null;
    }
  }
}
