import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
    ) {}

    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = this.patientRepository.create(createPatientDto);
        return await this.patientRepository.save(patient);
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientRepository.find();
    }

    async findOne(id: number): Promise<Patient> {
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const patient = await this.findOne(id);
        this.patientRepository.merge(patient, updatePatientDto);
        return await this.patientRepository.save(patient);
    }

    async remove(id: number): Promise<void> {
        const result = await this.patientRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
    }
}
