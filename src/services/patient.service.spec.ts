import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Attendance } from '../entities/attendance.entity';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';
import {
  PatientPriority,
  TreatmentStatus,
  AttendanceStatus,
} from '../common/enums';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  ValidationException,
  DuplicatePatientException,
  InvalidPatientPriorityException,
  TreatmentStatusUpdateException,
  PatientHasActiveAttendancesException,
} from '../common/exceptions';

describe('PatientService', () => {
  let service: PatientService;
  let repository: Repository<Patient>;

  const mockPatient = {
    id: 1,
    name: 'John Doe',
    phone: '(11) 99999-9999',
    priority: PatientPriority.NORMAL,
    treatment_status: TreatmentStatus.IN_TREATMENT,
    birth_date: new Date('1990-01-01'),
    main_complaint: 'Test complaint',
    start_date: new Date(),
    discharge_date: null,
    missing_appointments_streak: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => ({
      ...dto,
      treatment_status: dto.treatment_status || TreatmentStatus.IN_TREATMENT,
    })),
    save: jest.fn().mockImplementation((patient) =>
      Promise.resolve({
        id: 1,
        ...patient,
        treatment_status: TreatmentStatus.IN_TREATMENT,
      }),
    ),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
    find: jest.fn().mockResolvedValue([mockPatient]),
    findOne: jest.fn().mockResolvedValue(mockPatient),
    update: jest.fn().mockResolvedValue(true),
    delete: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: {} } as DeleteResult),
  };

  const mockAttendanceRepository = {
    find: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createDto: CreatePatientDto = {
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };

      // Mock findOne to return null (no existing patient)
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createDto,
        treatment_status: TreatmentStatus.IN_TREATMENT,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw DuplicatePatientException when patient already exists', async () => {
      const createDto: CreatePatientDto = {
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };

      // Mock findOne to return existing patient
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockPatient);

      await expect(service.create(createDto)).rejects.toThrow(
        DuplicatePatientException,
      );
    });

    it('should throw InvalidPatientPriorityException for invalid priority', async () => {
      const createDto: CreatePatientDto = {
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: 'INVALID_PRIORITY' as any, // Force invalid priority
      };

      // Mock findOne to return null (no existing patient)
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        InvalidPatientPriorityException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockPatient]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single patient', async () => {
      const result = await service.findOne(1);

      expect(result).toEqual(mockPatient);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findOne error cases', () => {
    it('should throw NotFoundException when patient not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when patient not found during removal', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updateDto: Partial<UpdatePatientDto> = {
        name: 'John Doe Updated',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };

      await service.update(1, updateDto as UpdatePatientDto);

      expect(repository.merge).toHaveBeenCalledWith(mockPatient, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ValidationException when no fields provided', async () => {
      const updateDto: Partial<UpdatePatientDto> = {};

      await expect(
        service.update(1, updateDto as UpdatePatientDto),
      ).rejects.toThrow(ValidationException);
    });

    it('should update treatment status with valid transition', async () => {
      const updateDto: Partial<UpdatePatientDto> = {
        treatment_status: TreatmentStatus.DISCHARGED,
      };

      await service.update(1, updateDto as UpdatePatientDto);

      expect(repository.merge).toHaveBeenCalledWith(mockPatient, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw TreatmentStatusUpdateException for invalid transition', async () => {
      const updateDto: Partial<UpdatePatientDto> = {
        treatment_status: TreatmentStatus.DISCHARGED,
      };

      // Mock to simulate invalid transition
      const originalPatient = {
        ...mockPatient,
        treatment_status: 'INVALID' as TreatmentStatus,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(originalPatient);

      await expect(
        service.update(1, updateDto as UpdatePatientDto),
      ).rejects.toThrow(TreatmentStatusUpdateException);
    });

    it('should throw InvalidPatientPriorityException for invalid priority', async () => {
      const updateDto: Partial<UpdatePatientDto> = {
        priority: '4' as PatientPriority, // Invalid priority
      };

      await expect(
        service.update(1, updateDto as UpdatePatientDto),
      ).rejects.toThrow(InvalidPatientPriorityException);
    });

    it('should update priority with valid value', async () => {
      const updateDto: Partial<UpdatePatientDto> = {
        priority: PatientPriority.EMERGENCY,
      };

      await service.update(1, updateDto as UpdatePatientDto);

      expect(repository.merge).toHaveBeenCalledWith(mockPatient, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a patient when no active attendances', async () => {
      jest.spyOn(mockAttendanceRepository, 'count').mockResolvedValueOnce(0);

      await service.remove(1);

      expect(mockAttendanceRepository.count).toHaveBeenCalledWith({
        where: {
          patient_id: 1,
          status: AttendanceStatus.SCHEDULED,
        },
      });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw PatientHasActiveAttendancesException when patient has active attendances', async () => {
      jest.spyOn(mockAttendanceRepository, 'count').mockResolvedValueOnce(2);

      await expect(service.remove(1)).rejects.toThrow(
        PatientHasActiveAttendancesException,
      );
    });

    it('should throw NotFoundException when patient not found during removal', async () => {
      jest.spyOn(mockAttendanceRepository, 'count').mockResolvedValueOnce(0);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
