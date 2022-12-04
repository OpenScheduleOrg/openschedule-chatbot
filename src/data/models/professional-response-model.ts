import { ActingProfessionalResponseModel } from ".";

export type ProfessionalResponseModel = {
  id: number;
  name: string;
  phone: string;
  reg_number: string;
  username: string;
  email: string;
  actuations: ActingProfessionalResponseModel[];
};
