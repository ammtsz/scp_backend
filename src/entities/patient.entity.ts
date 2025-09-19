import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { PatientPriority, TreatmentStatus } from '../common/enums';

@Entity('scp_patient')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: PatientPriority,
    default: PatientPriority.NORMAL,
  })
  priority: PatientPriority;

  @Column({
    type: 'enum',
    enum: TreatmentStatus,
    default: TreatmentStatus.NEW_PATIENT,
  })
  treatment_status: TreatmentStatus;

  @Column({ type: 'date', nullable: true })
  birth_date: string;

  @Column({ type: 'text', nullable: true })
  main_complaint: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  discharge_date: string;

  @Column({ type: 'integer', default: 0 })
  missing_appointments_streak: number;

  // Timezone-agnostic audit fields
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  created_date: string;

  @Column({ type: 'time', default: () => 'CURRENT_TIME' })
  created_time: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  updated_date: string;

  @Column({ type: 'time', default: () => 'CURRENT_TIME' })
  updated_time: string;
}
