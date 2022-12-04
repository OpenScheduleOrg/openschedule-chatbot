export type PatientBody = {
  name?: string;
  phone?: string;
  cpf?: string;
  birthdate?: Date;
  address?: string;
};

export type PatientFilter = {
  name?: string;
  limit?: number;
};
