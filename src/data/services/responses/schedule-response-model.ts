export type ScheduleResponseModel = {
  id: number;
  start_date: string;
  end_date?: string;
  start_time: number;
  end_time: number;
  max_visits: number;
  week_day: number;
  acting_id: number;
  clinic_id: number;
  clinic_name: string;
  speicalty_id: number;
  specialty_description: string;
  professional_id: number;
  professional_name: string;
};
