import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TreatmentSessionRecordService } from '../services/treatment-session-record.service';
import {
  CreateTreatmentSessionRecordDto,
  UpdateTreatmentSessionRecordDto,
  TreatmentSessionRecordResponseDto,
} from '../dtos/treatment-session-record.dto';
import {
  ApiCreateSessionRecordOperation,
  ApiGetSessionRecordsBySessionOperation,
  ApiTreatmentSessionRecordOperation,
  ApiUpdateSessionRecordOperation,
  ApiDeleteSessionRecordOperation,
  ApiCompleteSessionOperation,
  ApiMarkSessionMissedOperation,
  ApiRescheduleSessionOperation,
  ApiGetUpcomingSessionsForPatientOperation,
} from '../decorators/api-treatment-session-record.decorator';

@ApiTags('treatment-session-records')
@Controller('treatment-session-records')
export class TreatmentSessionRecordController {
  constructor(private readonly treatmentSessionRecordService: TreatmentSessionRecordService) {}

  // ========================
  // CRUD ENDPOINTS
  // ========================

  @Post()
  @ApiCreateSessionRecordOperation()
  async createSessionRecord(
    @Body(ValidationPipe) dto: CreateTreatmentSessionRecordDto,
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.createSessionRecord(dto);
  }

  @Get()
  @ApiTreatmentSessionRecordOperation('Get all session records')
  async getAllSessionRecords(): Promise<TreatmentSessionRecordResponseDto[]> {
    return this.treatmentSessionRecordService.getAllSessionRecords();
  }

  @Get('session/:sessionId')
  @ApiGetSessionRecordsBySessionOperation()
  async getSessionRecordsBySession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ): Promise<TreatmentSessionRecordResponseDto[]> {
    return this.treatmentSessionRecordService.getSessionRecordsBySession(sessionId);
  }

  @Get(':id')
  @ApiTreatmentSessionRecordOperation('Get a session record by ID')
  async getSessionRecordById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.getSessionRecordById(id);
  }

  @Put(':id')
  @ApiUpdateSessionRecordOperation()
  async updateSessionRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTreatmentSessionRecordDto,
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.updateSessionRecord(id, dto);
  }

  @Delete(':id')
  @ApiDeleteSessionRecordOperation()
  async deleteSessionRecord(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.treatmentSessionRecordService.deleteSessionRecord(id);
  }

  // ========================
  // BUSINESS LOGIC ENDPOINTS
  // ========================

  @Post(':id/complete')
  @ApiCompleteSessionOperation()
  async completeSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { attendanceId?: number; notes?: string },
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.completeSession(id, body.attendanceId, body.notes);
  }

  @Post(':id/mark-missed')
  @ApiMarkSessionMissedOperation()
  async markSessionMissed(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.markSessionMissed(id, body.reason);
  }

  @Post(':id/reschedule')
  @ApiRescheduleSessionOperation()
  async rescheduleSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newDate: string },
  ): Promise<TreatmentSessionRecordResponseDto> {
    return this.treatmentSessionRecordService.rescheduleSession(id, body.newDate);
  }

  // ===================
  // ANALYTICS ENDPOINTS
  // ===================

  @Get('patient/:patientId/upcoming')
  @ApiGetUpcomingSessionsForPatientOperation()
  async getUpcomingSessionsForPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Query('days', ParseIntPipe) days: number = 7,
  ): Promise<TreatmentSessionRecordResponseDto[]> {
    return this.treatmentSessionRecordService.getUpcomingSessionsForPatient(patientId, days);
  }
}
