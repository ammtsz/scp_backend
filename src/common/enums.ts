export enum PatientPriority {
    EMERGENCY = '1',
    INTERMEDIATE = '2',
    NORMAL = '3'
}

export enum PatientStatus {
    NEW = 'new',
    IN_PROGRESS = 'in_progress',
    ACTIVE = 'active',
    TERMINATED = 'terminated',
    FINISHED = 'finished'
}

export enum AttendanceType {
    SPIRITUAL = 'spiritual',
    LIGHT_BATH = 'light_bath',
    ROD = 'rod'
}

export enum AttendanceStatus {
    SCHEDULED = 'scheduled',
    CHECKED_IN = 'checked_in',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}
