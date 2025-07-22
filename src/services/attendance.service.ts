import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../dtos/attendance.dto';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { AttendanceStatus } from '../common/enums';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(ScheduleSetting)
        private scheduleSettingRepository: Repository<ScheduleSetting>,
    ) {}

    async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
        await this.validateScheduling(createAttendanceDto);
        const attendance = this.attendanceRepository.create(createAttendanceDto);
        return await this.attendanceRepository.save(attendance);
    }

    async findAll(): Promise<Attendance[]> {
        return await this.attendanceRepository.find({
            relations: ['patient']
        });
    }

    async findOne(id: number): Promise<Attendance> {
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['patient']
        });
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        return attendance;
    }

    async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
        const attendance = await this.findOne(id);
        
        if (updateAttendanceDto.status) {
            await this.validateStatusTransition(attendance.status, updateAttendanceDto.status);
        }
        
        this.attendanceRepository.merge(attendance, updateAttendanceDto);
        return await this.attendanceRepository.save(attendance);
    }

    async remove(id: number): Promise<void> {
        const result = await this.attendanceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
    }

    private async validateScheduling(dto: CreateAttendanceDto): Promise<void> {
        const setting = await this.scheduleSettingRepository.findOne({
            where: {
                day_of_week: new Date(dto.scheduled_date).getDay(),
                is_active: true
            }
        });

        if (!setting) {
            throw new BadRequestException('No scheduling settings available for this day');
        }

        // Check if the time is within operational hours
        if (dto.scheduled_time < setting.start_time || dto.scheduled_time > setting.end_time) {
            throw new BadRequestException('Selected time is outside operational hours');
        }

        // Check concurrent appointments
        const concurrent = await this.attendanceRepository.count({
            where: {
                scheduled_date: new Date(dto.scheduled_date),
                scheduled_time: dto.scheduled_time,
                type: dto.type,
                status: AttendanceStatus.SCHEDULED
            }
        });

        const maxConcurrent = dto.type === 'spiritual' 
            ? setting.max_concurrent_spiritual 
            : setting.max_concurrent_light_bath;

        if (concurrent >= maxConcurrent) {
            throw new BadRequestException('Maximum concurrent appointments reached for this time slot');
        }
    }

    private async validateStatusTransition(currentStatus: AttendanceStatus, newStatus: AttendanceStatus): Promise<void> {
        const validTransitions = {
            [AttendanceStatus.SCHEDULED]: [AttendanceStatus.CHECKED_IN, AttendanceStatus.CANCELLED],
            [AttendanceStatus.CHECKED_IN]: [AttendanceStatus.IN_PROGRESS],
            [AttendanceStatus.IN_PROGRESS]: [AttendanceStatus.COMPLETED],
            [AttendanceStatus.COMPLETED]: [],
            [AttendanceStatus.CANCELLED]: []
        };

        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
}
