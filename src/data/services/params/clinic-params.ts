export type ClinicBody = {
  name: string;
  phone: string;
  address: string;
  cnpj: string;
  latitude?: string;
  longitude?: string;
};

export type ClinicFilter = {
  name?: string;
};
