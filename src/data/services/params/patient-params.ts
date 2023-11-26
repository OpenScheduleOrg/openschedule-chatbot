export type PatientBody = {
  name?: string;
  phone?: string;
  registration?: string;
  cpf?: string;
  birthdate?: Date;
  address?: string;
};

export type PatientFilter = {
  name?: string;
  limit?: number;
};
