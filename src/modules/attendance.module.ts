import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { AttendanceController } from '../controllers/attendance.controller';
import { AttendanceService } from '../services/attendance.service';

@Module({
    imports: [TypeOrmModule.forFeature([Attendance, ScheduleSetting])],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService]
})
export class AttendanceModule {}
