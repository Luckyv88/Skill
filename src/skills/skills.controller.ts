/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
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
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMySkills(@Req() req: any) {
    const userId = req.user.userId;
    return this.skillsService.getMySkills(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all-users')
  async getAllSkills() {
    return this.skillsService.getAllSkills();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteSkill(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.skillsService.deleteSkill(userId, id);
  }
}
