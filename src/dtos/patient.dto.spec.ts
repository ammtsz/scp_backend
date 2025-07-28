import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponseDto,
} from './patient.dto';
import { PatientPriority, TreatmentStatus } from '../common/enums';

describe('Patient DTOs', () => {
  describe('CreatePatientDto', () => {
    it('should validate with valid data', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.phone = '(11) 99999-9999';
      dto.priority = PatientPriority.NORMAL;
      dto.treatment_status = TreatmentStatus.IN_TREATMENT;
      dto.birth_date = new Date('1990-01-01');
      dto.main_complaint = 'Frequent headaches';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with minimal required data', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'Jane Doe';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when name is empty', async () => {
      const dto = new CreatePatientDto();
      dto.name = '';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name is missing', async () => {
      const dto = new CreatePatientDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with invalid phone format', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.phone = '1234567890';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('phone');
      expect(errors[0].constraints?.matches).toContain(
        'format (XX) XXXXX-XXXX or (XX) XXXX-XXXX',
      );
    });

    it('should validate with valid phone format (8 digits)', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.phone = '(11) 9999-9999';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with valid phone format (9 digits)', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.phone = '(11) 99999-9999';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid priority enum', async () => {
      const dto = plainToClass(CreatePatientDto, {
        name: 'John Doe',
        priority: 'INVALID_PRIORITY',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
    });

    it('should fail validation with invalid treatment_status enum', async () => {
      const dto = plainToClass(CreatePatientDto, {
        name: 'John Doe',
        treatment_status: 'INVALID_STATUS',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('treatment_status');
    });

    it('should apply default values for optional fields', () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';

      expect(dto.priority).toBe(PatientPriority.NORMAL);
      expect(dto.treatment_status).toBe(TreatmentStatus.IN_TREATMENT);
    });

    it('should transform birth_date string to Date object', () => {
      const dto = plainToClass(CreatePatientDto, {
        name: 'John Doe',
        birth_date: '1990-06-15T12:00:00.000Z',
      });

      expect(dto.birth_date).toBeInstanceOf(Date);
      expect(dto.birth_date?.getFullYear()).toBe(1990);
    });
  });

  describe('UpdatePatientDto', () => {
    it('should extend CreatePatientDto with discharge_date', async () => {
      const dto = new UpdatePatientDto();
      dto.name = 'John Doe';
      dto.discharge_date = new Date('2025-12-31');

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should transform discharge_date string to Date object', () => {
      const dto = plainToClass(UpdatePatientDto, {
        name: 'John Doe',
        discharge_date: '2025-12-31',
      });

      expect(dto.discharge_date).toBeInstanceOf(Date);
      expect(dto.discharge_date?.getFullYear()).toBe(2025);
    });

    it('should allow all fields to be optional for partial updates', async () => {
      const dto = new UpdatePatientDto();
      // No fields set - should be valid for partial updates

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate fields when they are provided', async () => {
      const dto = new UpdatePatientDto();
      dto.phone = 'invalid-phone'; // Invalid phone format should fail validation

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('phone');
    });
  });

  describe('PatientResponseDto', () => {
    it('should have all required properties defined', () => {
      const dto = new PatientResponseDto();
      dto.id = 1;
      dto.name = 'Test';
      dto.phone = '(11) 99999-9999'; // Set optional property
      dto.priority = PatientPriority.NORMAL;
      dto.treatment_status = TreatmentStatus.IN_TREATMENT;
      dto.birth_date = new Date(); // Set optional property
      dto.main_complaint = 'Test complaint'; // Set optional property
      dto.discharge_date = new Date(); // Set optional property
      dto.start_date = new Date();
      dto.created_at = new Date();
      dto.updated_at = new Date();

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('phone');
      expect(dto).toHaveProperty('priority');
      expect(dto).toHaveProperty('treatment_status');
      expect(dto).toHaveProperty('birth_date');
      expect(dto).toHaveProperty('main_complaint');
      expect(dto).toHaveProperty('discharge_date');
      expect(dto).toHaveProperty('start_date');
      expect(dto).toHaveProperty('created_at');
      expect(dto).toHaveProperty('updated_at');
    });

    it('should be instantiable with full data', () => {
      const dto = new PatientResponseDto();
      dto.id = 1;
      dto.name = 'John Doe';
      dto.phone = '(11) 99999-9999';
      dto.priority = PatientPriority.EMERGENCY;
      dto.treatment_status = TreatmentStatus.DISCHARGED;
      dto.birth_date = new Date('1990-01-01');
      dto.main_complaint = 'Frequent headaches';
      dto.discharge_date = new Date('2025-12-31');
      dto.start_date = new Date('2025-07-22');
      dto.created_at = new Date();
      dto.updated_at = new Date();

      expect(dto.id).toBe(1);
      expect(dto.name).toBe('John Doe');
      expect(dto.priority).toBe(PatientPriority.EMERGENCY);
      expect(dto.treatment_status).toBe(TreatmentStatus.DISCHARGED);
    });
  });
});
