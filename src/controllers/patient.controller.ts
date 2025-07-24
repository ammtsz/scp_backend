import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PatientService } from '../services/patient.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponseDto,
} from '../dtos/patient.dto';
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
  constructor(private readonly patientService: PatientService) {}

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
}
