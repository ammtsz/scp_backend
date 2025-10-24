import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PatientService } from '../services/patient.service';
import { PatientNoteService } from '../services/patient-note.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponseDto,
} from '../dtos/patient.dto';
import {
  CreatePatientNoteDto,
  UpdatePatientNoteDto,
  PatientNoteResponseDto,
} from '../dtos/patient-note.dto';
import {
  ApiCreatePatientOperation,
  ApiUpdatePatientOperation,
  ApiDeletePatientOperation,
  ApiFindAllPatientsOperation,
  ApiFindOnePatientOperation,
} from '../decorators/api-patient.decorator';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly patientNoteService: PatientNoteService,
  ) {}

  @Post()
  @ApiCreatePatientOperation()
  async create(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return await this.patientService.create(createPatientDto);
  }

  @Get()
  @ApiFindAllPatientsOperation()
  async findAll(): Promise<PatientResponseDto[]> {
    return await this.patientService.findAll();
  }

  @Get(':id')
  @ApiFindOnePatientOperation()
  async findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return await this.patientService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdatePatientOperation()
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return await this.patientService.update(+id, updatePatientDto);
  }

  @Delete(':id')
  @ApiDeletePatientOperation()
  async remove(@Param('id') id: string): Promise<void> {
    await this.patientService.remove(+id);
  }

  // Patient Notes endpoints
  
  @Post(':id/notes')
  @ApiOperation({
    summary: 'Create a new note for a patient',
    description: 'Creates a new note for the specified patient',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient ID',
    type: 'number',
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: PatientNoteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async createNote(
    @Param('id') patientId: string,
    @Body() createPatientNoteDto: CreatePatientNoteDto,
  ): Promise<PatientNoteResponseDto> {
    return await this.patientNoteService.create(+patientId, createPatientNoteDto);
  }

  @Get(':id/notes')
  @ApiOperation({
    summary: 'Get all notes for a patient',
    description: 'Retrieves all notes for the specified patient, ordered by creation date (newest first)',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    type: [PatientNoteResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async getPatientNotes(
    @Param('id') patientId: string,
  ): Promise<PatientNoteResponseDto[]> {
    return await this.patientNoteService.findByPatientId(+patientId);
  }

  @Patch(':id/notes/:noteId')
  @ApiOperation({
    summary: 'Update a patient note',
    description: 'Updates an existing note for the specified patient',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient ID',
    type: 'number',
  })
  @ApiParam({
    name: 'noteId',
    description: 'Note ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: PatientNoteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or note not found',
  })
  async updateNote(
    @Param('id') patientId: string,
    @Param('noteId') noteId: string,
    @Body() updatePatientNoteDto: UpdatePatientNoteDto,
  ): Promise<PatientNoteResponseDto> {
    return await this.patientNoteService.update(
      +patientId,
      +noteId,
      updatePatientNoteDto,
    );
  }

  @Delete(':id/notes/:noteId')
  @ApiOperation({
    summary: 'Delete a patient note',
    description: 'Deletes an existing note for the specified patient',
  })
  @ApiParam({
    name: 'id',
    description: 'Patient ID',
    type: 'number',
  })
  @ApiParam({
    name: 'noteId',
    description: 'Note ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or note not found',
  })
  async deleteNote(
    @Param('id') patientId: string,
    @Param('noteId') noteId: string,
  ): Promise<void> {
    await this.patientNoteService.remove(+patientId, +noteId);
  }
}
