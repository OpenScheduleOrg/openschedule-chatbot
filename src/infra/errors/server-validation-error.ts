import { ValidationsResponse } from "../../data/services/responses";

export class ServerValidationError extends Error {
  constructor(readonly validations: ValidationsResponse) {
    super("Request possui campos inválido.");
    this.name = "ServerValidationError";
  }
}
