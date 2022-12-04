import { ValidationsResponse } from "../models";

export class ServerValidationError extends Error {
  constructor(readonly validations: ValidationsResponse) {
    super("Request possui campos inválido.");
    this.name = "ServerValidationError";
  }
}
