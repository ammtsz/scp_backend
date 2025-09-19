import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('scp_spiritual_treatment_record')
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

  @Column({ type: 'varchar', length: 20, nullable: true })
  light_bath_color: string;

  @Column({ default: false })
  rod: boolean;

  @Column({ default: false })
  spiritual_treatment: boolean;

  @Column({ type: 'integer', nullable: true })
  return_in_weeks: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Enhanced fields for Phase 2: Location Management + Treatment Details
  @Column('text', { array: true, default: [] })
  location: string[];

  @Column({ nullable: true })
  custom_location: string;

  @Column({ default: 1 })
  quantity: number;

  // Treatment session times converted to separate date/time fields (timezone-agnostic)
  @Column({ type: 'date', nullable: true })
  treatment_start_date: string;

  @Column({ type: 'time', nullable: true })
  treatment_start_time: string;

  @Column({ type: 'date', nullable: true })
  treatment_end_date: string;

  @Column({ type: 'time', nullable: true })
  treatment_end_time: string;

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
