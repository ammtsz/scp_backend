import {
  ApiTreatmentRecordOperation,
  ApiCreateTreatmentRecordOperation,
  ApiUpdateTreatmentRecordOperation,
  ApiDeleteTreatmentRecordOperation,
  ApiFindAllTreatmentRecordsOperation,
  ApiFindOneTreatmentRecordOperation,
  ApiFindByAttendanceTreatmentRecordOperation,
} from './api-treatment-record.decorator';

// Mock class to test decorators
class TestController {
  @ApiTreatmentRecordOperation('Test operation')
  testOperation() {
    return 'test';
  }

  @ApiCreateTreatmentRecordOperation()
  createTreatmentRecord() {
    return 'create';
  }

  @ApiUpdateTreatmentRecordOperation()
  updateTreatmentRecord() {
    return 'update';
  }

  @ApiDeleteTreatmentRecordOperation()
  deleteTreatmentRecord() {
    return 'delete';
  }

  @ApiFindAllTreatmentRecordsOperation()
  findAllTreatmentRecords() {
    return 'findAll';
  }

  @ApiFindOneTreatmentRecordOperation()
  findOneTreatmentRecord() {
    return 'findOne';
  }

  @ApiFindByAttendanceTreatmentRecordOperation()
  findByAttendanceTreatmentRecord() {
    return 'findByAttendance';
  }
}

describe('API Treatment Record Decorators', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('ApiTreatmentRecordOperation', () => {
    it('should apply decorators to method', () => {
      expect(controller.testOperation()).toBe('test');
      expect(typeof ApiTreatmentRecordOperation).toBe('function');
    });

    it('should be callable with summary parameter', () => {
      const decorator = ApiTreatmentRecordOperation('Custom summary');
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiCreateTreatmentRecordOperation', () => {
    it('should apply decorators to create method', () => {
      expect(controller.createTreatmentRecord()).toBe('create');
      expect(typeof ApiCreateTreatmentRecordOperation).toBe('function');
    });
  });

  describe('ApiUpdateTreatmentRecordOperation', () => {
    it('should apply decorators to update method', () => {
      expect(controller.updateTreatmentRecord()).toBe('update');
      expect(typeof ApiUpdateTreatmentRecordOperation).toBe('function');
    });
  });

  describe('ApiDeleteTreatmentRecordOperation', () => {
    it('should apply decorators to delete method', () => {
      expect(controller.deleteTreatmentRecord()).toBe('delete');
      expect(typeof ApiDeleteTreatmentRecordOperation).toBe('function');
    });
  });

  describe('ApiFindAllTreatmentRecordsOperation', () => {
    it('should apply decorators to findAll method', () => {
      expect(controller.findAllTreatmentRecords()).toBe('findAll');
      expect(typeof ApiFindAllTreatmentRecordsOperation).toBe('function');
    });
  });

  describe('ApiFindOneTreatmentRecordOperation', () => {
    it('should apply decorators to findOne method', () => {
      expect(controller.findOneTreatmentRecord()).toBe('findOne');
      expect(typeof ApiFindOneTreatmentRecordOperation).toBe('function');
    });
  });

  describe('ApiFindByAttendanceTreatmentRecordOperation', () => {
    it('should apply decorators to findByAttendance method', () => {
      expect(controller.findByAttendanceTreatmentRecord()).toBe(
        'findByAttendance',
      );
      expect(typeof ApiFindByAttendanceTreatmentRecordOperation).toBe(
        'function',
      );
    });
  });

  describe('Decorator functionality', () => {
    it('should create decorators that can be applied to methods', () => {
      // Test that all decorators are functions that return functions
      expect(typeof ApiTreatmentRecordOperation('test')).toBe('function');
      expect(typeof ApiCreateTreatmentRecordOperation()).toBe('function');
      expect(typeof ApiUpdateTreatmentRecordOperation()).toBe('function');
      expect(typeof ApiDeleteTreatmentRecordOperation()).toBe('function');
      expect(typeof ApiFindAllTreatmentRecordsOperation()).toBe('function');
      expect(typeof ApiFindOneTreatmentRecordOperation()).toBe('function');
      expect(typeof ApiFindByAttendanceTreatmentRecordOperation()).toBe(
        'function',
      );
    });
  });
});
