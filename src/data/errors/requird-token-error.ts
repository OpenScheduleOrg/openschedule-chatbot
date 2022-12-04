export class RequiredTokenError extends Error {
  constructor() {
    super("Necessário um token de acesso.");
    this.name = "RequiredTokenError";
  }
}
