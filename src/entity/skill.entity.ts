import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Skills user HAS
  @Column('jsonb', { default: [] })
  haveSkills: { name: string; experience: number; projects: string }[];

  // Skills user WANTS (only name)
  @Column('simple-array', { default: '' })
  wantSkills: string[];

  // Many skills belong to one user
  @ManyToOne(() => User, (user) => user.skills)
  user: User;
}
