import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  experience: number;

  @Column({ nullable: true })
  projects: string;

  @Column()
  type: 'HAVE' | 'WANT';

  // Many skills belong to one user
  @ManyToOne(() => User, (user) => user.skills)
  user: User;
}
