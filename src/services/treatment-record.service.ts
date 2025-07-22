import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { CreateTreatmentRecordDto, UpdateTreatmentRecordDto } from '../dtos/treatment-record.dto';

@Injectable()
export class TreatmentRecordService {
    constructor(
        @InjectRepository(TreatmentRecord)
        private treatmentRecordRepository: Repository<TreatmentRecord>,
    ) {}

    async create(createTreatmentRecordDto: CreateTreatmentRecordDto): Promise<TreatmentRecord> {
        const record = this.treatmentRecordRepository.create(createTreatmentRecordDto);
        return await this.treatmentRecordRepository.save(record);
    }

    async findAll(): Promise<TreatmentRecord[]> {
        return await this.treatmentRecordRepository.find({
            relations: ['attendance', 'attendance.patient']
        });
    }

    async findOne(id: number): Promise<TreatmentRecord> {
        const record = await this.treatmentRecordRepository.findOne({
            where: { id },
            relations: ['attendance', 'attendance.patient']
        });
        if (!record) {
            throw new NotFoundException(`Treatment record with ID ${id} not found`);
        }
        return record;
    }

    async findByAttendance(attendanceId: number): Promise<TreatmentRecord> {
        const record = await this.treatmentRecordRepository.findOne({
            where: { attendance_id: attendanceId },
            relations: ['attendance', 'attendance.patient']
        });
        if (!record) {
            throw new NotFoundException(`Treatment record for attendance ${attendanceId} not found`);
        }
        return record;
    }

    async update(id: number, updateTreatmentRecordDto: UpdateTreatmentRecordDto): Promise<TreatmentRecord> {
        const record = await this.findOne(id);
        this.treatmentRecordRepository.merge(record, updateTreatmentRecordDto);
        return await this.treatmentRecordRepository.save(record);
    }

    async remove(id: number): Promise<void> {
        const result = await this.treatmentRecordRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Treatment record with ID ${id} not found`);
        }
    }
}
