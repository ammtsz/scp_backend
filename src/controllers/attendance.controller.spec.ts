import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from '../services/attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '../dtos/attendance.dto';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { ResourceNotFoundException } from '../common/exceptions';

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
    create: jest.fn((dto) =>
      Promise.resolve({
        id: 1,
        ...dto,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    ),
    findAll: jest.fn(() => Promise.resolve([mockAttendance])),
    findOne: jest.fn(() =>
      Promise.resolve({
        id: 1,
        patient_id: 1,
        patient: null,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: new Date('2025-07-22'),
        scheduled_time: '14:30',
        notes: 'Test notes',
        created_at: new Date(),
        updated_at: new Date(),
        checked_in_at: null,
        started_at: null,
        completed_at: null,
        cancelled_at: null,
      }),
    ),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn(() => Promise.resolve(undefined)),
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

      expect(result).toMatchObject({
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_time: '14:30',
        notes: 'Test notes',
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        ResourceNotFoundException,
      );
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

    it('should throw ResourceNotFoundException when attendance not found for update', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(null);

      const updateDto: UpdateAttendanceDto = {
        notes: 'Updated notes',
      };

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual(undefined);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found for deletion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.remove('999')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });
});
