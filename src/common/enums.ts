export enum PatientPriority {
  EMERGENCY = '1',
  INTERMEDIATE = '2',
  NORMAL = '3',
}

export enum TreatmentStatus {
  NEW_PATIENT = 'N', // Novo paciente
  IN_TREATMENT = 'T', // Em tratamento
  DISCHARGED = 'A', // Alta médica espiritual
  ABSENT = 'F', // Faltas consecutivas
}

export enum AttendanceType {
  SPIRITUAL = 'spiritual',
  LIGHT_BATH = 'light_bath',
  ROD = 'rod',
}

export enum AttendanceStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
