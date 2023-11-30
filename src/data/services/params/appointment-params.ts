export type AppointmentBody = {
  acting_id?: number;
  patient_id?: number;
  complaint?: string;
  prescription?: string;
  scheduled_day?: Date;
  start_time?: number;
  end_time?: number;
};

export type AppointmentFilter = {
  start_date?: string;
  end_date?: string;
  start_time?: number;
  patient_id?: number;
  acting_id?: number;
  professional_id?: number;
  clinic_id?: number;
  specialty_id?: number;
};
