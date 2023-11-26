export type ProfessionalActingModel = {
  id: number;
  clinic_id: number;
  clinic_name: string;
  specialty_id: number;
  specialty_description: string;
};

export type ProfessionalModel = {
  id: number;
  name: string;
  phone: string;
  reg_number: string;
  username: string;
  email: string;
  actuations?: ProfessionalActingModel[];
};
