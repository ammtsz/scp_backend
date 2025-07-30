import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceResponseDto,
  AttendanceAgendaDto,
  NextAttendanceDateDto,
} from '../dtos/attendance.dto';
import { AttendanceTransformer } from '../transformers/attendance.transformer';
import {
  ApiAttendanceOperation,
  ApiCreateAttendanceOperation,
  ApiUpdateAttendanceOperation,
} from '../decorators/api-attendance.decorator';
import { ResourceNotFoundException } from '../common/exceptions/base.exception';

@ApiTags('Attendances')
@Controller('attendances')
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateAttendanceOperation()
  @ApiBody({ type: CreateAttendanceDto })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    this.logger.log(
      `Creating new attendance for patient ${createAttendanceDto.patient_id}`,
    );
    const attendance = await this.attendanceService.create(createAttendanceDto);
    this.logger.log(
      `Created attendance ${attendance.id} for patient ${attendance.patient_id}`,
    );
    return AttendanceTransformer.toResponseDto(attendance);
  }

  @Get()
  @ApiAttendanceOperation('Retrieve all attendance records')
  async findAll(): Promise<AttendanceResponseDto[]> {
    this.logger.log('Retrieving all attendances');
    const attendances = await this.attendanceService.findAll();
    this.logger.log(`Found ${attendances.length} attendances`);
    return AttendanceTransformer.toResponseDtoList(attendances);
  }

  @Get('agenda')
  @ApiAttendanceOperation('Get all attendances for agenda view')
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by attendance status',
    enum: ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by attendance type',
    enum: ['spiritual', 'light_bath'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of results',
    type: 'number',
  })
  async findAllForAgenda(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ): Promise<AttendanceAgendaDto[]> {
    this.logger.log('Fetching all attendances for agenda view', {
      status,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    
    const filters = {
      status: status as any,
      type: type as any,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    
    const rawData = await this.attendanceService.findAllForAgenda(filters);
    return AttendanceTransformer.toAgendaDtoList(rawData);
  }

  @Get('next-date')
  @ApiAttendanceOperation('Get next scheduled attendance date')
  async getNextScheduledDate(): Promise<NextAttendanceDateDto> {
    this.logger.log('Fetching next scheduled attendance date');
    try {
      const nextDate = await this.attendanceService.findNextScheduledDate();
      this.logger.log(`Next scheduled date found: ${nextDate || 'none'}`);
      return AttendanceTransformer.toNextDateDto(nextDate);
    } catch (error) {
      this.logger.error('Error fetching next scheduled date:', error);
      throw error;
    }
  }

  @Get('stats')
  @ApiAttendanceOperation('Get attendance statistics')
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to get stats for (YYYY-MM-DD). Defaults to today.',
    type: 'string',
  })
  async getAttendanceStats(
    @Query('date') date?: string
  ): Promise<{
    total: number;
    scheduled: number;
    checked_in: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    by_type: { spiritual: number; light_bath: number };
  }> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Fetching attendance statistics for date: ${targetDate}`);
    
    const stats = await this.attendanceService.getAttendanceStats(targetDate);
    return stats;
  }

  @Post('bulk-update')
  @ApiAttendanceOperation('Bulk update attendance statuses with automatic timestamps')
  @ApiBody({
    description: 'Bulk update request. Automatically sets appropriate timestamp fields based on status.',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of attendance IDs to update'
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'],
          description: 'New status for all attendances. Automatically sets: checked_in_at, started_at, completed_at, or cancelled_at'
        }
      },
      required: ['ids', 'status']
    }
  })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: { ids: number[]; status: string }
  ): Promise<{ updated: number; success: boolean }> {
    this.logger.log(`Bulk updating ${bulkUpdateDto.ids.length} attendances to status: ${bulkUpdateDto.status}`);
    
    try {
      const updatedCount = await this.attendanceService.bulkUpdateStatus(
        bulkUpdateDto.ids,
        bulkUpdateDto.status as any
      );
      
      this.logger.log(`Successfully updated ${updatedCount} attendances with timestamps`);
      return { updated: updatedCount, success: true };
    } catch (error) {
      this.logger.error('Error in bulk update:', error);
      throw error;
    }
  }

  @Get('date/:date')
  @ApiAttendanceOperation('Retrieve attendances for a specific date')
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format to retrieve attendances for',
    type: 'string',
    example: '2024-01-15',
  })
  async findByDate(@Param('date') date: string): Promise<AttendanceResponseDto[]> {
    this.logger.log(`Retrieving attendances for date ${date}`);
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      this.logger.warn(`Invalid date format: ${date}`);
      throw new ResourceNotFoundException('Invalid date format. Use YYYY-MM-DD', date);
    }
    
    const attendances = await this.attendanceService.findByDate(date);
    this.logger.log(`Found ${attendances.length} attendances for date ${date}`);
    return AttendanceTransformer.toResponseDtoList(attendances);
  }

  @Get(':id')
  @ApiAttendanceOperation('Retrieve a specific attendance record')
  @ApiParam({
    name: 'id',
    description: 'ID of the attendance record to retrieve',
    type: 'number',
  })
  async findOne(@Param('id') id: string): Promise<AttendanceResponseDto> {
    this.logger.log(`Retrieving attendance with ID ${id}`);
    const attendance = await this.attendanceService.findOne(+id);
    if (!attendance) {
      this.logger.warn(`Attendance with ID ${id} not found`);
      throw new ResourceNotFoundException('Attendance', id);
    }
    return AttendanceTransformer.toResponseDto(attendance);
  }

  @Patch(':id')
  @ApiUpdateAttendanceOperation()
  @ApiParam({
    name: 'id',
    description: 'ID of the attendance record to update',
    type: 'number',
  })
  @ApiBody({ type: UpdateAttendanceDto })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    this.logger.log(`Updating attendance with ID ${id}`);
    const attendance = await this.attendanceService.update(
      +id,
      updateAttendanceDto,
    );
    if (!attendance) {
      this.logger.warn(`Attendance with ID ${id} not found`);
      throw new ResourceNotFoundException('Attendance', id);
    }
    this.logger.log(`Successfully updated attendance ${id}`);
    return AttendanceTransformer.toResponseDto(attendance);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiAttendanceOperation('Delete an attendance record')
  @ApiParam({
    name: 'id',
    description: 'ID of the attendance record to delete',
    type: 'number',
  })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting attendance with ID ${id}`);
    const attendance = await this.attendanceService.findOne(+id);
    if (!attendance) {
      this.logger.warn(`Attendance with ID ${id} not found`);
      throw new ResourceNotFoundException('Attendance', id);
    }
    await this.attendanceService.remove(+id);
    this.logger.log(`Successfully deleted attendance ${id}`);
  }
}
