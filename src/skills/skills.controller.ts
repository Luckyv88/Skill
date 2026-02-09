/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { AddSkillDto } from './dto/add-skill.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addSkill(@Req() req: any, @Body() dto: AddSkillDto) {
    const userId = req.user.userId; // comes from JwtStrategy.validate()
    return this.skillsService.addSkill(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('matches')
  async findMatches(@Req() req: any) {
    const userId = req.user.userId;
    return this.skillsService.findMatches(userId);
  }

  // src/skills/skills.controller.ts
  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAllSkills(@Req() req: any) {
    return this.skillsService.getAllSkills();
  }
}
