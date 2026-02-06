import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';

@Entity('skill_requests')
export class SkillRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Sender of the request
  @ManyToOne(() => User, (user) => user.sentRequests)
  sender: User;

  // Receiver of the request
  @ManyToOne(() => User, (user) => user.receivedRequests)
  receiver: User;

  // Status of the request
  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
