import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentRecordService } from './treatment-record.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  CreateTreatmentRecordDto,
  UpdateTreatmentRecordDto,
} from '../dtos/treatment-record.dto';
import {
  DuplicateTreatmentRecordException,
  InvalidAttendanceStatusException,
  InvalidReturnWeeksException,
} from '../common/exceptions';
import { AttendanceStatus, AttendanceType } from '../common/enums';

describe('TreatmentRecordService', () => {
  let service: TreatmentRecordService;
  let repository: Repository<TreatmentRecord>;
  let mockAttendanceRepository: Repository<Attendance>;

  const mockPatient = {
    id: 1,
    name: 'John Doe',
  };

  const mockAttendance = {
    id: 1,
    patient: mockPatient as any,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.COMPLETED,
  } as Attendance;

  const mockTreatmentRecord: TreatmentRecord = {
    id: 1,
    attendance_id: 1,
    attendance: mockAttendance as any,
    food: 'Avoid processed foods',
    water: 'Drink 2L of water daily',
    ointments: 'Chamomile ointment',
    light_bath: true,
    rod: false,
    spiritual_treatment: true,
    return_in_weeks: 2,
    notes: 'Patient responded well to treatment',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((record) => Promise.resolve({ id: 1, ...record })),
    find: jest.fn().mockResolvedValue([mockTreatmentRecord]),
    findOne: jest.fn(),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
    delete: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: {} } as DeleteResult),
  };

  beforeEach(async () => {
    mockRepository.findOne.mockReset();
    mockRepository.findOne.mockImplementation(async (options: any) => {
      if (options.where?.id === 1 || options.where?.attendance_id === 1) {
        return mockTreatmentRecord;
      }
      return null;
    });

    const attendanceRepoMock = {
      findOne: jest.fn().mockResolvedValue(mockAttendance),
    } as unknown as Repository<Attendance>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentRecordService,
        {
          provide: getRepositoryToken(TreatmentRecord),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: attendanceRepoMock,
        },
      ],
    }).compile();

    service = module.get<TreatmentRecordService>(TreatmentRecordService);
    repository = module.get<Repository<TreatmentRecord>>(
      getRepositoryToken(TreatmentRecord),
    );
    mockAttendanceRepository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateTreatmentRecordDto = {
      attendance_id: 1,
      food: 'Avoid processed foods',
      water: 'Drink 2L of water daily',
      ointments: 'Chamomile ointment',
      light_bath: true,
      rod: false,
      spiritual_treatment: true,
      return_in_weeks: 2,
      notes: 'Patient responded well to treatment',
    };

    it('should create a new treatment record', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null); // No existing record

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createDto,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw DuplicateTreatmentRecordException when treatment record exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockTreatmentRecord) // Existing record found
        .mockResolvedValueOnce(mockAttendance); // Attendance check (shouldn't reach here)

      await expect(service.create(createDto)).rejects.toThrow(
        DuplicateTreatmentRecordException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { attendance_id: createDto.attendance_id },
      });
    });

    it('should throw InvalidReturnWeeksException when return weeks is invalid', async () => {
      const invalidDto = { ...createDto, return_in_weeks: 53 };
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing record
        .mockResolvedValueOnce(mockAttendance); // Attendance check (shouldn't reach here)

      await expect(service.create(invalidDto)).rejects.toThrow(
        InvalidReturnWeeksException,
      );
    });

    it('should throw InvalidAttendanceStatusException when attendance is cancelled', async () => {
      const cancelledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CANCELLED,
      };

      mockRepository.findOne.mockResolvedValueOnce(null); // No existing record
      jest
        .spyOn(mockAttendanceRepository, 'findOne')
        .mockResolvedValueOnce(cancelledAttendance); // Cancelled attendance

      await expect(service.create(createDto)).rejects.toThrow(
        InvalidAttendanceStatusException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of treatment records with relations', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockTreatmentRecord]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['attendance', 'attendance.patient'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single treatment record', async () => {
      const result = await service.findOne(1);

      expect(result).toEqual(mockTreatmentRecord);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['attendance', 'attendance.patient'],
      });
    });

    it('should throw NotFoundException when treatment record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAttendance', () => {
    it('should return a treatment record for a specific attendance', async () => {
      const result = await service.findByAttendance(1);

      expect(result).toEqual(mockTreatmentRecord);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { attendance_id: 1 },
        relations: ['attendance', 'attendance.patient'],
      });
    });

    it('should throw NotFoundException when no record exists for attendance', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findByAttendance(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a treatment record', async () => {
      const updateDto = {
        attendance_id: 1,
        food: 'Updated food recommendations',
        water: 'Updated water recommendations',
        notes: 'Updated treatment notes',
      } as UpdateTreatmentRecordDto;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockTreatmentRecord);

      await service.update(1, updateDto);

      expect(repository.merge).toHaveBeenCalledWith(
        mockTreatmentRecord,
        updateDto,
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when treatment record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const updateDto = {
        attendance_id: 1,
        food: 'Updated food recommendations',
      } as UpdateTreatmentRecordDto;

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a treatment record', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when treatment record not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
