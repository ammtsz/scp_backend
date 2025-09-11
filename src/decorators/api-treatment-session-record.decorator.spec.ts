import {
  ApiTreatmentSessionRecordOperation,
  ApiCreateSessionRecordOperation,
  ApiUpdateSessionRecordOperation,
  ApiDeleteSessionRecordOperation,
  ApiGetSessionRecordsBySessionOperation,
  ApiCompleteSessionOperation,
  ApiMarkSessionMissedOperation,
  ApiRescheduleSessionOperation,
  ApiGetUpcomingSessionsForPatientOperation,
} from './api-treatment-session-record.decorator';

describe('API Treatment Session Record Decorators', () => {
  describe('ApiTreatmentSessionRecordOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiTreatmentSessionRecordOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiTreatmentSessionRecordOperation('Test summary');
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiCreateSessionRecordOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiCreateSessionRecordOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiCreateSessionRecordOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiUpdateSessionRecordOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiUpdateSessionRecordOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiUpdateSessionRecordOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiDeleteSessionRecordOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiDeleteSessionRecordOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiDeleteSessionRecordOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiGetSessionRecordsBySessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiGetSessionRecordsBySessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiGetSessionRecordsBySessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiCompleteSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiCompleteSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiCompleteSessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiMarkSessionMissedOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiMarkSessionMissedOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiMarkSessionMissedOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiRescheduleSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiRescheduleSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiRescheduleSessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiGetUpcomingSessionsForPatientOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiGetUpcomingSessionsForPatientOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiGetUpcomingSessionsForPatientOperation();
      expect(typeof decorator).toBe('function');
    });
  });
});
