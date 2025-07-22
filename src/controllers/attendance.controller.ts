import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto, AttendanceResponseDto } from '../dtos/attendance.dto';
import { AttendanceTransformer } from '../transformers/attendance.transformer';

@ApiTags('Attendances')
@Controller('attendances')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new attendance' })
    @ApiBody({ type: CreateAttendanceDto })
    @ApiResponse({ 
        status: 201, 
        description: 'The attendance has been successfully created.',
        type: AttendanceResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
        const attendance = await this.attendanceService.create(createAttendanceDto);
        return AttendanceTransformer.toResponseDto(attendance);
    }

    @Get()
    @ApiOperation({ summary: 'Get all attendances' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all attendances',
        type: [AttendanceResponseDto]
    })
    async findAll(): Promise<AttendanceResponseDto[]> {
        const attendances = await this.attendanceService.findAll();
        return AttendanceTransformer.toResponseDtoList(attendances);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attendance by ID' })
    @ApiParam({ name: 'id', description: 'Attendance ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'The attendance record',
        type: AttendanceResponseDto
    })
    @ApiResponse({ status: 404, description: 'Attendance not found.' })
    async findOne(@Param('id') id: string): Promise<AttendanceResponseDto> {
        const attendance = await this.attendanceService.findOne(+id);
        return AttendanceTransformer.toResponseDto(attendance);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update attendance' })
    @ApiParam({ name: 'id', description: 'Attendance ID' })
    @ApiBody({ type: UpdateAttendanceDto })
    @ApiResponse({ 
        status: 200, 
        description: 'The attendance has been successfully updated.',
        type: AttendanceResponseDto
    })
    @ApiResponse({ status: 404, description: 'Attendance not found.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async update(
        @Param('id') id: string,
        @Body() updateAttendanceDto: UpdateAttendanceDto
    ): Promise<AttendanceResponseDto> {
        const attendance = await this.attendanceService.update(+id, updateAttendanceDto);
        return AttendanceTransformer.toResponseDto(attendance);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete attendance' })
    @ApiParam({ name: 'id', description: 'Attendance ID' })
    @ApiResponse({ status: 204, description: 'The attendance has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Attendance not found.' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.attendanceService.remove(+id);
    }
}
