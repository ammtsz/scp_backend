import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { TreatmentRecordController } from '../controllers/treatment-record.controller';
import { TreatmentRecordService } from '../services/treatment-record.service';

@Module({
    imports: [TypeOrmModule.forFeature([TreatmentRecord])],
    controllers: [TreatmentRecordController],
    providers: [TreatmentRecordService],
    exports: [TreatmentRecordService]
})
export class TreatmentRecordModule {}
