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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TreatmentRecordService } from '../services/treatment-record.service';
import {
  CreateTreatmentRecordDto,
  UpdateTreatmentRecordDto,
  TreatmentRecordResponseDto,
  UpdateTreatmentRecordResponseDto,
} from '../dtos/treatment-record.dto';
import {
  ApiCreateTreatmentRecordOperation,
  ApiUpdateTreatmentRecordOperation,
  ApiDeleteTreatmentRecordOperation,
  ApiFindAllTreatmentRecordsOperation,
  ApiFindOneTreatmentRecordOperation,
  ApiFindByAttendanceTreatmentRecordOperation,
} from '../decorators/api-treatment-record.decorator';

@ApiTags('Treatment Records')
@Controller('treatment-records')
export class TreatmentRecordController {
  constructor(
    private readonly treatmentRecordService: TreatmentRecordService,
  ) {}

  @Post()
  @ApiCreateTreatmentRecordOperation()
  async create(
    @Body() createTreatmentRecordDto: CreateTreatmentRecordDto,
  ): Promise<UpdateTreatmentRecordResponseDto> {
    const record = await this.treatmentRecordService.create(createTreatmentRecordDto);
    return {
      record: record as TreatmentRecordResponseDto,
    };
  }

  @Get()
  @ApiFindAllTreatmentRecordsOperation()
  async findAll(): Promise<TreatmentRecordResponseDto[]> {
    return await this.treatmentRecordService.findAll();
  }

  @Get(':id')
  @ApiFindOneTreatmentRecordOperation()
  async findOne(@Param('id') id: string): Promise<TreatmentRecordResponseDto> {
    return await this.treatmentRecordService.findOne(+id);
  }

  @Get('attendance/:id')
  @ApiFindByAttendanceTreatmentRecordOperation()
  async findByAttendance(
    @Param('id') id: string,
  ): Promise<TreatmentRecordResponseDto> {
    return await this.treatmentRecordService.findByAttendance(+id);
  }

  @Patch(':id')
  @ApiUpdateTreatmentRecordOperation()
  async update(
    @Param('id') id: string,
    @Body() updateTreatmentRecordDto: UpdateTreatmentRecordDto,
  ): Promise<UpdateTreatmentRecordResponseDto> {
    const record = await this.treatmentRecordService.update(
      +id,
      updateTreatmentRecordDto,
    );
    return {
      record: record as TreatmentRecordResponseDto,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteTreatmentRecordOperation()
  async remove(@Param('id') id: string): Promise<void> {
    await this.treatmentRecordService.remove(+id);
  }
}
