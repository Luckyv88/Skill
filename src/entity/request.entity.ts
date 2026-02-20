import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('skill_requests')
@Index('IDX_REQ_SENDER', ['sender'])
@Index('IDX_REQ_RECEIVER', ['receiver'])
@Index('IDX_REQ_STATUS', ['status'])
export class SkillRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentRequests)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedRequests)
  receiver: User;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
