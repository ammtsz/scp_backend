import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';
import { PatientPriority, PatientStatus } from '../common/enums';

describe('PatientController', () => {
  let controller: PatientController;
  let service: PatientService;

  const mockPatient = {
    id: 1,
    name: 'John Doe',
    phone: '(11) 99999-9999',
    priority: PatientPriority.NORMAL,
    status: PatientStatus.NEW,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPatientService = {
    create: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([mockPatient])),
    findOne: jest.fn(id => Promise.resolve(mockPatient)),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn(id => Promise.resolve({ deleted: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: mockPatientService,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createDto: CreatePatientDto = {
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };

      const result = await controller.create(createDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createDto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const result = await controller.findAll();
      
      expect(result).toEqual([mockPatient]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single patient', async () => {
      const result = await controller.findOne('1');
      
      expect(result).toEqual(mockPatient);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updateDto: UpdatePatientDto = {
        name: 'John Doe Updated',
        phone: '(11) 99999-9999',
        priority: PatientPriority.NORMAL,
      };
      
      const result = await controller.update('1', updateDto);
      
      expect(result).toEqual({
        id: 1,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      const result = await controller.remove('1');
      
      expect(result).toEqual(undefined);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
