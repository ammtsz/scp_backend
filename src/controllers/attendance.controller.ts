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
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceResponseDto,
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
