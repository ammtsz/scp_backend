import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ScheduleSettingService } from '../services/schedule-setting.service';
import { CreateScheduleSettingDto, UpdateScheduleSettingDto, ScheduleSettingResponseDto } from '../dtos/schedule-setting.dto';

@ApiTags('Schedule Settings')
@Controller('schedule-settings')
export class ScheduleSettingController {
    constructor(private readonly scheduleSettingService: ScheduleSettingService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new schedule setting' })
    @ApiBody({ type: CreateScheduleSettingDto })
    @ApiResponse({ 
        status: 201, 
        description: 'The schedule setting has been successfully created.',
        type: ScheduleSettingResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async create(@Body() createScheduleSettingDto: CreateScheduleSettingDto): Promise<ScheduleSettingResponseDto> {
        return await this.scheduleSettingService.create(createScheduleSettingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all schedule settings' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all schedule settings',
        type: [ScheduleSettingResponseDto]
    })
    async findAll(): Promise<ScheduleSettingResponseDto[]> {
        return await this.scheduleSettingService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get schedule setting by ID' })
    @ApiParam({ name: 'id', description: 'Schedule Setting ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'The schedule setting',
        type: ScheduleSettingResponseDto
    })
    @ApiResponse({ status: 404, description: 'Schedule setting not found.' })
    async findOne(@Param('id') id: string): Promise<ScheduleSettingResponseDto> {
        return await this.scheduleSettingService.findOne(+id);
    }

    @Get('day/:dayOfWeek')
    @ApiOperation({ summary: 'Get schedule setting by day of week' })
    @ApiParam({ 
        name: 'dayOfWeek', 
        description: 'Day of week (0 = Sunday, 6 = Saturday)',
        type: 'number'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'The schedule setting for the specified day',
        type: ScheduleSettingResponseDto
    })
    @ApiResponse({ status: 404, description: 'Schedule setting not found.' })
    async findByDay(@Param('dayOfWeek') dayOfWeek: string): Promise<ScheduleSettingResponseDto> {
        return await this.scheduleSettingService.findByDay(+dayOfWeek);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update schedule setting' })
    @ApiParam({ name: 'id', description: 'Schedule Setting ID' })
    @ApiBody({ type: UpdateScheduleSettingDto })
    @ApiResponse({ 
        status: 200, 
        description: 'The schedule setting has been successfully updated.',
        type: ScheduleSettingResponseDto
    })
    @ApiResponse({ status: 404, description: 'Schedule setting not found.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async update(
        @Param('id') id: string,
        @Body() updateScheduleSettingDto: UpdateScheduleSettingDto
    ): Promise<ScheduleSettingResponseDto> {
        return await this.scheduleSettingService.update(+id, updateScheduleSettingDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete schedule setting' })
    @ApiParam({ name: 'id', description: 'Schedule Setting ID' })
    @ApiResponse({ status: 204, description: 'The schedule setting has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Schedule setting not found.' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.scheduleSettingService.remove(+id);
    }
}
