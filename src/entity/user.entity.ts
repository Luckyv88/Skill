import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Skill } from './skill.entity';
import { SkillRequest } from './request.entity';

@Entity('users')
@Index('IDX_USER_EMAIL', ['email'])
@Index('IDX_USER_USERNAME', ['username'])
@Index('IDX_USER_PHONE', ['phone'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullname: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'text' })
  profilepic: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @OneToMany(() => Skill, (skill) => skill.user)
  skills: Skill[];

  @OneToMany(() => SkillRequest, (req) => req.sender)
  sentRequests: SkillRequest[];

  @OneToMany(() => SkillRequest, (req) => req.receiver)
  receivedRequests: SkillRequest[];
}
