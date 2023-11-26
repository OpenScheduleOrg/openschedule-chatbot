import { PatientService } from "@/data/services";

class MockPatientService extends PatientService {
  create = jest.fn();
  update = jest.fn();
  load = jest.fn();
  getByPhone = jest.fn();
  getById = jest.fn();
  getByCpf = jest.fn();
  deleteById = jest.fn();
}

export const makePatientServiceMock = (): PatientService =>
  new MockPatientService(undefined);
