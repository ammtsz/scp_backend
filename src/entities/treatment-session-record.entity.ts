import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TreatmentSession } from './treatment-session.entity';
import { Attendance } from './attendance.entity';

export enum SessionRecordStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

@Entity('scp_treatment_session_records')
export class TreatmentSessionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  treatment_session_id: number;

  @ManyToOne(() => TreatmentSession, (session) => session.sessionRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'treatment_session_id' })
  treatmentSession: TreatmentSession;

  @Column({ nullable: true })
  attendance_id: number;

  @ManyToOne(() => Attendance, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column({ type: 'integer' })
  session_number: number; // 1, 2, 3, etc.

  @Column({ type: 'varchar', length: 10 })
  scheduled_date: string; // Store as string in YYYY-MM-DD format (timezone-agnostic)

  @Column({ type: 'time', nullable: true })
  start_time: string;

  @Column({ type: 'time', nullable: true })
  end_time: string;

  @Column({
    type: 'enum',
    enum: SessionRecordStatus,
    default: SessionRecordStatus.SCHEDULED,
  })
  status: SessionRecordStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  missed_reason: string; // For tracking why session was missed

  @Column({ type: 'varchar', length: 100, nullable: true })
  performed_by: string; // Who performed the treatment

  // Timezone-agnostic created/updated date/time pairs
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  created_date: string;

  @Column({ type: 'time', default: () => 'CURRENT_TIME' })
  created_time: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  updated_date: string;

  @Column({ type: 'time', default: () => 'CURRENT_TIME' })
  updated_time: string;
}
