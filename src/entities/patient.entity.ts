import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';
import { PatientPriority, PatientStatus } from '../common/enums';

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
        default: PatientPriority.NORMAL
    })
    priority: PatientPriority;

    @Column({
        type: 'enum',
        enum: PatientStatus,
        default: PatientStatus.NEW
    })
    status: PatientStatus;

    @Column({ type: 'date', nullable: true })
    birth_date: Date;

    @Column({ type: 'text', nullable: true })
    main_complaint: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    discharge_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
