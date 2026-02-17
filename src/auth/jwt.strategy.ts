/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      //More optimized built-in extractor
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookie,
      ]),
      secretOrKey: process.env.JWT_SECRET_KEY as string,
    });
  }

  private static extractJwtFromCookie(req: any): string | null {
    return req?.cookies?.jwt ?? null;
  }

  validate(payload: { sub: string }) {
    //Return minimal object
    return { id: payload.sub };
  }
}
