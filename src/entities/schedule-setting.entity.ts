import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';

@Entity('scp_schedule_setting')
export class ScheduleSetting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Check('day_of_week BETWEEN 0 AND 6')
    day_of_week: number;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ default: 1 })
    max_concurrent_spiritual: number;

    @Column({ default: 1 })
    max_concurrent_light_bath: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
