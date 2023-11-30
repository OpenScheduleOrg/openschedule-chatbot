import { CredentialManager } from "@/security";
import { HttpClient, HttpRequest } from "./http-client";

export class AuthorizeHttpClient extends HttpClient {
  constructor(url: string, private readonly credentials: CredentialManager) {
    super(url);
  }

  async post<R>(
    url: string,
    request: HttpRequest = { headers: {} }
  ): Promise<R> {
    if (!request.headers || !request.headers.authorization)
      request.headers = {
        ...request.headers,
        authorization: "Bearer " + (await this.credentials.getAccessToken()),
      };

    return await super.post<R>(url, request);
  }

  async get<R>(
    url: string,
    request: HttpRequest = { headers: {} }
  ): Promise<R> {
    if (!request.headers || !request.headers.authorization)
      request.headers = {
        ...request.headers,
        authorization: "Bearer " + (await this.credentials.getAccessToken()),
      };

    return await super.get<R>(url, request);
  }

  async put<R>(
    url: string,
    request: HttpRequest = { headers: {} }
  ): Promise<R> {
    if (!request.headers || !request.headers.authorization)
      request.headers = {
        ...request.headers,
        authorization: "Bearer " + (await this.credentials.getAccessToken()),
      };

    return await super.put<R>(url, request);
  }

  async delete(
    url: string,
    request: HttpRequest = { headers: {} }
  ): Promise<void> {
    if (!request.headers || !request.headers.authorization)
      request.headers = {
        ...request.headers,
        authorization: "Bearer " + (await this.credentials.getAccessToken()),
      };

    return await super.delete(url, request);
  }
}
