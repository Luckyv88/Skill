/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entity/skill.entity';
import { User } from '../entity/user.entity';
import { AddSkillDto } from './dto/add-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async addSkill(userId: string, dto: AddSkillDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const skill = this.skillRepo.create({
      haveSkills: dto.haveSkills || [],
      wantSkills: dto.wantSkills || [],
      user,
    });

    return this.skillRepo.save(skill);
  }

  async findMatches(userId: string) {
    // Fetch my skills
    const mySkills = await this.skillRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    const want: string[] = [];
    mySkills.forEach((s) =>
      s.wantSkills.forEach((w) =>
        want.push(w.toLowerCase().replace(/\s+/g, '')),
      ),
    );

    if (want.length === 0) return [];

    // Fetch all other users' skills
    const allSkills = await this.skillRepo.find({ relations: ['user'] });

    // Filter matches
    const matches = allSkills.filter((s) => {
      if (s.user.id === userId) return false; // exclude self

      const have = s.haveSkills.map((h) =>
        typeof h === 'string'
          ? (h as string).toLowerCase().replace(/\s+/g, '')
          : (h as any).name.toLowerCase().replace(/\s+/g, ''),
      );

      // Check if any of my wants exist in their haveSkills
      return want.some((w) => have.includes(w));
    });

    return matches;
  }

  async getAllSkills() {
    return this.skillRepo.find({ relations: ['user'] });
  }
}
