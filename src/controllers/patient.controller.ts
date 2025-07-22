import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from '../dtos/patient.dto';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new patient' })
    @ApiBody({ type: CreatePatientDto })
    @ApiResponse({ 
        status: 201, 
        description: 'The patient has been successfully created.',
        type: PatientResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async create(@Body() createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
        return await this.patientService.create(createPatientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all patients' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all patients',
        type: [PatientResponseDto]
    })
    async findAll(): Promise<PatientResponseDto[]> {
        return await this.patientService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get patient by ID' })
    @ApiParam({ name: 'id', description: 'Patient ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'The patient record',
        type: PatientResponseDto
    })
    @ApiResponse({ status: 404, description: 'Patient not found.' })
    async findOne(@Param('id') id: string): Promise<PatientResponseDto> {
        return await this.patientService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update patient' })
    @ApiParam({ name: 'id', description: 'Patient ID' })
    @ApiBody({ type: UpdatePatientDto })
    @ApiResponse({ 
        status: 200, 
        description: 'The patient has been successfully updated.',
        type: PatientResponseDto
    })
    @ApiResponse({ status: 404, description: 'Patient not found.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async update(
        @Param('id') id: string,
        @Body() updatePatientDto: UpdatePatientDto
    ): Promise<PatientResponseDto> {
        return await this.patientService.update(+id, updatePatientDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete patient' })
    @ApiParam({ name: 'id', description: 'Patient ID' })
    @ApiResponse({ status: 204, description: 'The patient has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Patient not found.' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.patientService.remove(+id);
    }
}
