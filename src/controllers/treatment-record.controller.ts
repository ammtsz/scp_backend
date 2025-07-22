import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TreatmentRecordService } from '../services/treatment-record.service';
import { CreateTreatmentRecordDto, UpdateTreatmentRecordDto, TreatmentRecordResponseDto } from '../dtos/treatment-record.dto';

@ApiTags('Treatment Records')
@Controller('treatment-records')
export class TreatmentRecordController {
    constructor(private readonly treatmentRecordService: TreatmentRecordService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new treatment record' })
    @ApiBody({ type: CreateTreatmentRecordDto })
    @ApiResponse({ 
        status: 201, 
        description: 'The treatment record has been successfully created.',
        type: TreatmentRecordResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async create(@Body() createTreatmentRecordDto: CreateTreatmentRecordDto): Promise<TreatmentRecordResponseDto> {
        return await this.treatmentRecordService.create(createTreatmentRecordDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all treatment records' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all treatment records',
        type: [TreatmentRecordResponseDto]
    })
    async findAll(): Promise<TreatmentRecordResponseDto[]> {
        return await this.treatmentRecordService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get treatment record by ID' })
    @ApiParam({ name: 'id', description: 'Treatment Record ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'The treatment record',
        type: TreatmentRecordResponseDto
    })
    @ApiResponse({ status: 404, description: 'Treatment record not found.' })
    async findOne(@Param('id') id: string): Promise<TreatmentRecordResponseDto> {
        return await this.treatmentRecordService.findOne(+id);
    }

    @Get('attendance/:id')
    @ApiOperation({ summary: 'Get treatment record by attendance ID' })
    @ApiParam({ name: 'id', description: 'Attendance ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'The treatment record for the attendance',
        type: TreatmentRecordResponseDto
    })
    @ApiResponse({ status: 404, description: 'Treatment record not found.' })
    async findByAttendance(@Param('id') id: string): Promise<TreatmentRecordResponseDto> {
        return await this.treatmentRecordService.findByAttendance(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update treatment record' })
    @ApiParam({ name: 'id', description: 'Treatment Record ID' })
    @ApiBody({ type: UpdateTreatmentRecordDto })
    @ApiResponse({ 
        status: 200, 
        description: 'The treatment record has been successfully updated.',
        type: TreatmentRecordResponseDto
    })
    @ApiResponse({ status: 404, description: 'Treatment record not found.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async update(
        @Param('id') id: string,
        @Body() updateTreatmentRecordDto: UpdateTreatmentRecordDto
    ): Promise<TreatmentRecordResponseDto> {
        return await this.treatmentRecordService.update(+id, updateTreatmentRecordDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete treatment record' })
    @ApiParam({ name: 'id', description: 'Treatment Record ID' })
    @ApiResponse({ status: 204, description: 'The treatment record has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Treatment record not found.' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.treatmentRecordService.remove(+id);
    }
}
