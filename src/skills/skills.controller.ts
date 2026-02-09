/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private service: SkillsService) {}

  @Post('add')
  add(@Req() req: any, @Body() body: any) {
    return this.service.addSkill(req.user.userId, body);
  }

  @Get('matches')
  matches(@Req() req: any) {
    return this.service.findMatches(req.user.userId);
  }
}
