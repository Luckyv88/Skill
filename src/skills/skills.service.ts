/* eslint-disable @typescript-eslint/no-unused-vars */
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
    if (!user) {
      throw new Error('User not found');
    }
    const skill = this.skillRepo.create({ ...dto, user });
    return this.skillRepo.save(skill);
  }

  async findMatches(userId: string) {
    const mySkills = await this.skillRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    const have = mySkills.filter((s) => s.type === 'HAVE').map((s) => s.name);
    const want = mySkills.filter((s) => s.type === 'WANT').map((s) => s.name);

    return this.skillRepo
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.user', 'user')
      .where('skill.name IN (:...want)', { want })
      .andWhere('skill.type = :type', { type: 'HAVE' })
      .andWhere('user.id != :id', { id: userId })
      .getMany();
  }
}
