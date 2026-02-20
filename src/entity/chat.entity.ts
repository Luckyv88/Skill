import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../entity/user.entity';

@Entity()
@Index('IDX_CHAT_SENDER_RECEIVER_CREATED', ['sender', 'receiver', 'createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @Index()
  sender: User;

  @ManyToOne(() => User)
  @Index()
  receiver: User;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
