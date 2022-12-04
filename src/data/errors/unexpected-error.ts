export class UnexpectedError extends Error {
  constructor() {
    super("Algo de errado ocorreu.");
    this.name = "UnexpectedError";
  }
}
