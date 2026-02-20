import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('skills')
@Index('IDX_SKILL_USER', ['user'])
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { default: [] })
  haveSkills: { name: string; experience: number; projects: string }[];

  @Column('simple-array', { default: '' })
  wantSkills: string[];

  @ManyToOne(() => User, (user) => user.skills)
  user: User;
}
