import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../dtos/attendance.dto';
import { AttendanceType, AttendanceStatus } from '../common/enums';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockAttendance = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: '2025-07-22',
    scheduled_time: '14:30',
    checked_in_at: undefined,
    started_at: undefined,
    completed_at: undefined,
    cancelled_at: undefined,
    notes: 'Test notes',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAttendanceService = {
    create: jest.fn(dto => Promise.resolve({ 
      ...mockAttendance, 
      ...dto,
      scheduled_date: new Date(dto.scheduled_date),
    })),
    findAll: jest.fn(() => Promise.resolve([{
      ...mockAttendance,
      scheduled_date: new Date(mockAttendance.scheduled_date),
    }])),
    findOne: jest.fn(id => Promise.resolve({
      ...mockAttendance,
      scheduled_date: new Date(mockAttendance.scheduled_date),
    })),
    update: jest.fn((id, dto) => Promise.resolve({ 
      ...mockAttendance, 
      ...dto,
      scheduled_date: dto.scheduled_date ? new Date(dto.scheduled_date) : new Date(mockAttendance.scheduled_date),
    })),
    remove: jest.fn(id => Promise.resolve(undefined)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new attendance', async () => {
      const createDto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      const result = await controller.create(createDto);

      expect(result).toMatchObject({
        id: expect.any(Number),
        ...createDto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attendances', async () => {
      const result = await controller.findAll();
      
      expect(result).toEqual([mockAttendance]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attendance', async () => {
      const result = await controller.findOne('1');
      
      expect(result).toEqual(mockAttendance);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an attendance', async () => {
      const updateDto: UpdateAttendanceDto = {
        notes: 'Updated notes',
      };
      
      const result = await controller.update('1', updateDto);
      
      expect(result).toMatchObject({
        id: 1,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      const result = await controller.remove('1');
      
      expect(result).toEqual(undefined);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
