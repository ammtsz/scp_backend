import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TreatmentSessionService } from '../services/treatment-session.service';
import {
  CreateTreatmentSessionDto,
  UpdateTreatmentSessionDto,
  TreatmentSessionResponseDto,
} from '../dtos/treatment-session.dto';
import {
  ApiCreateTreatmentSessionOperation,
  ApiGetTreatmentSessionsByPatientOperation,
  ApiGetTreatmentSessionsByTreatmentRecordOperation,
  ApiTreatmentSessionOperation,
  ApiUpdateTreatmentSessionOperation,
  ApiDeleteTreatmentSessionOperation,
  ApiGetTreatmentStatsOperation,
} from '../decorators/api-treatment-session.decorator';

@ApiTags('treatment-sessions')
@Controller('treatment-sessions')
export class TreatmentSessionController {
  constructor(private readonly treatmentSessionService: TreatmentSessionService) {}

  // ========================
  // TREATMENT SESSION ENDPOINTS
  // ========================

  @Get()
  @ApiTreatmentSessionOperation('Get all treatment sessions')
  async getAllTreatmentSessions(): Promise<TreatmentSessionResponseDto[]> {
    return this.treatmentSessionService.getAllTreatmentSessions();
  }

  @Post()
  @ApiCreateTreatmentSessionOperation()
  async createTreatmentSession(
    @Body() rawBody: any,
  ): Promise<TreatmentSessionResponseDto> {
    console.log('🔍 Raw request body received:', JSON.stringify(rawBody, null, 2));
    
    // Manual validation to see the exact error
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    
    try {
      const dto = await validationPipe.transform(rawBody, {
        type: 'body',
        metatype: CreateTreatmentSessionDto,
      });
      console.log('✅ Validation passed, DTO:', dto);
      return this.treatmentSessionService.createTreatmentSession(dto);
    } catch (error) {
      console.error('❌ Validation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        constraints: error.response?.message
      });
      throw error;
    }
  }

  @Get('patient/:patientId')
  @ApiGetTreatmentSessionsByPatientOperation()
  async getTreatmentSessionsByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
  ): Promise<TreatmentSessionResponseDto[]> {
    return this.treatmentSessionService.getTreatmentSessionsByPatient(patientId);
  }

  @Get('treatment-record/:treatmentRecordId')
  @ApiGetTreatmentSessionsByTreatmentRecordOperation()
  async getTreatmentSessionsByTreatmentRecord(
    @Param('treatmentRecordId', ParseIntPipe) treatmentRecordId: number,
  ): Promise<TreatmentSessionResponseDto[]> {
    return this.treatmentSessionService.getTreatmentSessionsByTreatmentRecord(treatmentRecordId);
  }

  @Get('date/:date')
  @ApiTreatmentSessionOperation('Get treatment sessions by date')
  async getTreatmentSessionsByDate(
    @Param('date') date: string,
  ): Promise<TreatmentSessionResponseDto[]> {
    return this.treatmentSessionService.getTreatmentSessionsByDate(date);
  }

  @Get(':id')
  @ApiTreatmentSessionOperation('Get a treatment session by ID')
  async getTreatmentSessionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentSessionResponseDto> {
    return this.treatmentSessionService.getTreatmentSessionById(id);
  }

  @Put(':id')
  @ApiUpdateTreatmentSessionOperation()
  async updateTreatmentSession(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTreatmentSessionDto,
  ): Promise<TreatmentSessionResponseDto> {
    return this.treatmentSessionService.updateTreatmentSession(id, dto);
  }

  @Delete(':id')
  @ApiDeleteTreatmentSessionOperation()
  async deleteTreatmentSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.treatmentSessionService.deleteTreatmentSession(id);
  }

  // ===================
  // ANALYTICS ENDPOINTS
  // ===================

  @Get('patient/:patientId/stats')
  @ApiGetTreatmentStatsOperation()
  async getTreatmentStats(@Param('patientId', ParseIntPipe) patientId: number): Promise<any> {
    return this.treatmentSessionService.getTreatmentStats(patientId);
  }
}
