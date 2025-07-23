import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentRecordController } from './treatment-record.controller';
import { TreatmentRecordService } from '../services/treatment-record.service';
import { CreateTreatmentRecordDto, UpdateTreatmentRecordDto } from '../dtos/treatment-record.dto';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceType, AttendanceStatus } from '../common/enums';

describe('TreatmentRecordController', () => {
  let controller: TreatmentRecordController;
  let service: TreatmentRecordService;

  const mockTreatmentRecordService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByAttendance: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAttendance: Attendance = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: new Date(),
    scheduled_time: '14:30',
    notes: 'Test notes',
    checked_in_at: null,
    started_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    patient: null,
  };

  const mockTreatmentRecord: TreatmentRecord = {
    id: 1,
    attendance_id: 1,
    attendance: mockAttendance,
    food: 'Test food recommendations',
    water: 'Test water recommendations',
    ointments: 'Test ointments',
    light_bath: true,
    rod: false,
    spiritual_treatment: true,
    return_in_weeks: 2,
    notes: 'Test notes',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentRecordController],
      providers: [
        {
          provide: TreatmentRecordService,
          useValue: mockTreatmentRecordService,
        },
      ],
    }).compile();

    controller = module.get<TreatmentRecordController>(TreatmentRecordController);
    service = module.get<TreatmentRecordService>(TreatmentRecordService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateTreatmentRecordDto = {
      attendance_id: 1,
      food: 'Test food recommendations',
      water: 'Test water recommendations',
      ointments: 'Test ointments',
      light_bath: true,
      rod: false,
      spiritual_treatment: true,
      return_in_weeks: 2,
      notes: 'Test notes',
    };

    it('should create a treatment record', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockTreatmentRecord);
      
      const result = await controller.create(createDto);
      
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockTreatmentRecord.id);
      expect(result.attendance_id).toBe(mockTreatmentRecord.attendance_id);
      expect(result.food).toBe(mockTreatmentRecord.food);
    });
  });

  describe('findAll', () => {
    it('should return an array of treatment records', async () => {
      const treatmentRecords = [mockTreatmentRecord];
      jest.spyOn(service, 'findAll').mockResolvedValue(treatmentRecords);
      
      const result = await controller.findAll();
      
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(treatmentRecords);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockTreatmentRecord.id);
    });
  });

  describe('findOne', () => {
    it('should return a treatment record by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTreatmentRecord);
      
      const result = await controller.findOne('1');
      
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockTreatmentRecord.id);
      expect(result.attendance_id).toBe(mockTreatmentRecord.attendance_id);
    });
  });

  describe('findByAttendance', () => {
    it('should return a treatment record by attendance id', async () => {
      jest.spyOn(service, 'findByAttendance').mockResolvedValue(mockTreatmentRecord);
      
      const result = await controller.findByAttendance('1');
      
      expect(service.findByAttendance).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockTreatmentRecord.id);
      expect(result.attendance_id).toBe(1);
    });
  });

  describe('update', () => {
    const updateDto: UpdateTreatmentRecordDto = {
      attendance_id: 1,
      food: 'Updated food recommendations',
      water: 'Updated water recommendations',
      ointments: 'Updated ointments',
      light_bath: false,
      rod: true,
      spiritual_treatment: true,
      return_in_weeks: 3,
      notes: 'Updated notes',
    };

    it('should update a treatment record', async () => {
      const updatedRecord = {
        ...mockTreatmentRecord,
        ...updateDto,
        id: 1,
        created_at: mockTreatmentRecord.created_at,
        updated_at: new Date(),
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedRecord);
      
      const result = await controller.update('1', updateDto);
      
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(updatedRecord.id);
      expect(result.food).toBe(updateDto.food);
      expect(result.water).toBe(updateDto.water);
      expect(result.ointments).toBe(updateDto.ointments);
    });
  });

  describe('remove', () => {
    it('should remove a treatment record', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      
      await controller.remove('1');
      
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should return void when successfully removed', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      
      const result = await controller.remove('1');
      
      expect(result).toBeUndefined();
    });
  });
});
