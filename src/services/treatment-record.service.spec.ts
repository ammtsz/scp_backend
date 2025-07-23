import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentRecordService } from './treatment-record.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTreatmentRecordDto, UpdateTreatmentRecordDto } from '../dtos/treatment-record.dto';

describe('TreatmentRecordService', () => {
  let service: TreatmentRecordService;
  let repository: Repository<TreatmentRecord>;

  const mockPatient = {
    id: 1,
    name: 'John Doe',
  };

  const mockAttendance = {
    id: 1,
    patient: mockPatient,
    type: 'spiritual',
    status: 'completed',
  };

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
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(record => Promise.resolve({ id: 1, ...record })),
    find: jest.fn().mockResolvedValue([mockTreatmentRecord]),
    findOne: jest.fn().mockResolvedValue(mockTreatmentRecord),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
    delete: jest.fn().mockResolvedValue({ affected: 1, raw: {} } as DeleteResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentRecordService,
        {
          provide: getRepositoryToken(TreatmentRecord),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TreatmentRecordService>(TreatmentRecordService);
    repository = module.get<Repository<TreatmentRecord>>(getRepositoryToken(TreatmentRecord));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new treatment record', async () => {
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

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createDto,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of treatment records with relations', async () => {
      const result = await service.findAll();
      
      expect(result).toEqual([mockTreatmentRecord]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['attendance', 'attendance.patient']
      });
    });
  });

  describe('findOne', () => {
    it('should return a single treatment record', async () => {
      const result = await service.findOne(1);
      
      expect(result).toEqual(mockTreatmentRecord);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['attendance', 'attendance.patient']
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
        relations: ['attendance', 'attendance.patient']
      });
    });

    it('should throw NotFoundException when no record exists for attendance', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findByAttendance(999)).rejects.toThrow(NotFoundException);
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

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockTreatmentRecord);
      
      const result = await service.update(1, updateDto);

      expect(repository.merge).toHaveBeenCalledWith(mockTreatmentRecord, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when treatment record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      
      const updateDto = {
        attendance_id: 1,
        food: 'Updated food recommendations',
      } as UpdateTreatmentRecordDto;
      
      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a treatment record', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when treatment record not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
