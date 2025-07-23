import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('scp_treatment_record')
@Check(`"return_in_weeks" > 0 AND "return_in_weeks" <= 52`)
export class TreatmentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attendance_id: number;

  @OneToOne(() => Attendance, (attendance) => attendance.treatmentRecord, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column({ type: 'text', nullable: true })
  food: string;

  @Column({ type: 'text', nullable: true })
  water: string;

  @Column({ type: 'text', nullable: true })
  ointments: string;

  @Column({ default: false })
  light_bath: boolean;

  @Column({ default: false })
  rod: boolean;

  @Column({ default: false })
  spiritual_treatment: boolean;

  @Column({ type: 'integer', nullable: true })
  return_in_weeks: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
