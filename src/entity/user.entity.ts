import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Skill } from './skill.entity';
import { SkillRequest } from './request.entity';

@Entity('users')
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

  @Column()
  password: string;

  @Column({ type: 'text' })
  profilepic: string;

  @CreateDateColumn()
  createdAt: Date;

  // One user can have many skills
  @OneToMany(() => Skill, (skill) => skill.user)
  skills: Skill[];

  // One user can send many requests
  @OneToMany(() => SkillRequest, (req) => req.sender)
  sentRequests: SkillRequest[];

  // One user can receive many requests
  @OneToMany(() => SkillRequest, (req) => req.receiver)
  receivedRequests: SkillRequest[];
}
