import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
} from 'typeorm';
import { Patient } from './patient.entity';
import { TreatmentRecord } from './treatment-record.entity';
import { Attendance } from './attendance.entity';

export enum TreatmentType {
  LIGHT_BATH = 'light_bath',
  ROD = 'rod',
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('scp_treatment_sessions')
@Check(`"planned_sessions" > 0 AND "planned_sessions" <= 50`)
@Check(`"duration_minutes" IS NULL OR ("duration_minutes" > 0 AND "duration_minutes" <= 70)`)
@Check(`
  (treatment_type = 'light_bath' AND duration_minutes IS NOT NULL AND color IS NOT NULL) OR
  (treatment_type = 'rod' AND duration_minutes IS NULL AND color IS NULL)
`)
export class TreatmentSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  treatment_record_id: number;

  @ManyToOne(() => TreatmentRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_record_id' })
  treatmentRecord: TreatmentRecord;

  @Column()
  attendance_id: number;

  @ManyToOne(() => Attendance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column()
  patient_id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: TreatmentType,
  })
  treatment_type: TreatmentType;

  @Column({ type: 'varchar', length: 100 })
  body_location: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'integer' })
  planned_sessions: number;

  @Column({ type: 'integer', default: 0 })
  completed_sessions: number;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  // Light bath specific fields (required when treatment_type = 'light_bath')
  @Column({ type: 'integer', nullable: true })
  duration_minutes: number; // for light bath (7min units: 1=7min, 2=14min, etc.)

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string; // for light bath only

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany('TreatmentSessionRecord', 'treatmentSession')
  sessionRecords: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
