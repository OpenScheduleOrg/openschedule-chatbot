export type AppointmentModel = {
  id: number;
  patient_name: string;
  patient_id: number;
  acting_id: number;
  scheduled_day: string;
  start_time: number;
  end_time?: number;
  complaint?: string;
  prescription?: string;
  clinic_name: string;
  clinic_id: number;
  professional_name: string;
  professional_id: number;
  specialty_description: string;
  specialty_id: number;
};
