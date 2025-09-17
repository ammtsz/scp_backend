import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { Patient } from './patient.entity';
import { TreatmentRecord } from './treatment-record.entity';
import { TreatmentSessionRecord } from './treatment-session-record.entity';

@Entity('scp_attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: AttendanceType,
  })
  type: AttendanceType;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.SCHEDULED,
  })
  status: AttendanceStatus;

  @Column({ type: 'date' })
  scheduled_date: Date;

  @Column({ type: 'time' })
  scheduled_time: string;

  @Column({ type: 'timestamp', nullable: true })
  checked_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'boolean', nullable: true })
  absence_justified: boolean;

  @Column({ type: 'text', nullable: true })
  absence_notes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  treatment_session_record_id: number;

  @ManyToOne(() => TreatmentSessionRecord, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treatment_session_record_id' })
  treatmentSessionRecord: TreatmentSessionRecord;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(
    () => TreatmentRecord,
    (treatmentRecord) => treatmentRecord.attendance,
  )
  treatmentRecord: TreatmentRecord;
}
