import {
  ApiTreatmentSessionOperation,
  ApiCreateTreatmentSessionOperation,
  ApiUpdateTreatmentSessionOperation,
  ApiDeleteTreatmentSessionOperation,
  ApiGetTreatmentSessionsByPatientOperation,
  ApiGetTreatmentSessionsByTreatmentRecordOperation,
  ApiGetTreatmentStatsOperation,
} from './api-treatment-session.decorator';

describe('API Treatment Session Decorators', () => {
  describe('ApiTreatmentSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiTreatmentSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiTreatmentSessionOperation('Test summary');
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiCreateTreatmentSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiCreateTreatmentSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiCreateTreatmentSessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiUpdateTreatmentSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiUpdateTreatmentSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiUpdateTreatmentSessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiDeleteTreatmentSessionOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiDeleteTreatmentSessionOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiDeleteTreatmentSessionOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiGetTreatmentSessionsByPatientOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiGetTreatmentSessionsByPatientOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiGetTreatmentSessionsByPatientOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiGetTreatmentSessionsByTreatmentRecordOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiGetTreatmentSessionsByTreatmentRecordOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiGetTreatmentSessionsByTreatmentRecordOperation();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('ApiGetTreatmentStatsOperation', () => {
    it('should be a function', () => {
      expect(typeof ApiGetTreatmentStatsOperation).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = ApiGetTreatmentStatsOperation();
      expect(typeof decorator).toBe('function');
    });
  });
});
