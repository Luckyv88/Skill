/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Skill } from '../entity/skill.entity';
import { User } from '../entity/user.entity';
import { AddSkillDto } from './dto/add-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private redis: Redis, // Added
  ) {}

  async getMySkills(userId: string) {
    const cacheKey = `skills:my:${userId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skills = await this.skillRepo.find({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    await this.redis.set(cacheKey, JSON.stringify(skills), 'EX', 120);

    return skills;
  }

  async addSkill(userId: string, dto: AddSkillDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const formattedWant = (dto.wantSkills?.[0] || '')
      .toLowerCase()
      .replace(/\s+/g, '');

    const existingSkills = await this.skillRepo.find({
      where: { user: { id: userId } },
    });

    const duplicate = existingSkills.some((skill) =>
      skill.wantSkills.some(
        (w) => w.toLowerCase().replace(/\s+/g, '') === formattedWant,
      ),
    );

    if (duplicate) {
      throw new Error('Skill already added in Want section');
    }

    const skill = this.skillRepo.create({
      haveSkills: dto.haveSkills || [],
      wantSkills: dto.wantSkills || [],
      user,
    });

    const saved = await this.skillRepo.save(skill);

    //  Clear related cache
    await this.redis.del(`skills:my:${userId}`);
    await this.redis.del(`skills:all`);
    await this.redis.del(`skills:matches:${userId}`);

    return saved;
  }

  async findMatches(userId: string) {
    const cacheKey = `skills:matches:${userId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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

    const allSkills = await this.skillRepo.find({ relations: ['user'] });

    const matches = allSkills.filter((s) => {
      if (s.user.id === userId) return false;

      const have = s.haveSkills.map((h: any) =>
        typeof h === 'string'
          ? h.toLowerCase().replace(/\s+/g, '')
          : h.name.toLowerCase().replace(/\s+/g, ''),
      );

      return want.some((w) => have.includes(w));
    });

    await this.redis.set(cacheKey, JSON.stringify(matches), 'EX', 60);

    return matches;
  }

  async getAllSkills() {
    const cacheKey = `skills:all`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skills = await this.skillRepo.find({
      relations: { user: true },
    });

    await this.redis.set(cacheKey, JSON.stringify(skills), 'EX', 120);

    return skills;
  }

  async deleteSkill(userId: string, skillId: string) {
    const skill = await this.skillRepo.findOne({
      where: { id: skillId },
      relations: { user: true },
    });

    if (!skill) {
      throw new Error('Skill not found');
    }

    if (!skill.user || skill.user.id !== userId) {
      throw new Error('Unauthorized');
    }

    await this.skillRepo.delete(skillId);

    // Clear cache
    await this.redis.del(`skills:my:${userId}`);
    await this.redis.del(`skills:all`);
    await this.redis.del(`skills:matches:${userId}`);

    return { message: 'Skill deleted successfully' };
  }
}
