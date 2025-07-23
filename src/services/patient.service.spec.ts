import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dtos/patient.dto';
import { PatientPriority, PatientStatus } from '../common/enums';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PatientService', () => {
  let service: PatientService;
  let repository: Repository<Patient>;

  const mockPatient = {
    id: 1,
    name: 'John Doe',
    phone: '(11) 99999-9999',
    priority: PatientPriority.NORMAL,
    status: PatientStatus.NEW,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => ({
      ...dto,
      status: dto.status || PatientStatus.NEW,
    })),
    save: jest.fn().mockImplementation(patient => Promise.resolve({ id: 1, ...patient, status: PatientStatus.NEW })),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
    find: jest.fn().mockResolvedValue([mockPatient]),
    findOne: jest.fn().mockResolvedValue(mockPatient),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue({ affected: 1, raw: {} } as DeleteResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
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
        priority: PatientPriority.NORMAL
      };

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createDto,
        status: PatientStatus.NEW,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
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
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updateDto = { 
        name: 'John Doe Updated',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };
      
      await service.update(1, updateDto);
      
      expect(repository.merge).toHaveBeenCalledWith(mockPatient, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      await service.remove(1);
      
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
