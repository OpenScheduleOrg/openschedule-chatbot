import axios, { Axios, AxiosError } from "axios";
import {
  AccessDeniedError,
  BadRequestError,
  RequiredTokenError,
  ServerValidationError,
  UnexpectedError,
  ResourceNotFoundError,
} from "../errors";
import { MessageResponse, ValidationsResponse } from "../models";

export type HttpRequest = {
  body?: any;
  params?: any;
  headers?: any;
};

export class HttpClient {
  private readonly axios: Axios;
  constructor(url: string) {
    this.axios = axios.create({
      baseURL: url,
      headers: {
        "content-type": "application/json",
      },
      withCredentials: true,
    });
  }

  public async post<R>(url: string, request: HttpRequest = {}): Promise<R> {
    return this.axios
      .post<R>(url, request.body, {
        params: request.params,
        headers: request.headers,
      })
      .then((res) => res.data)
      .catch(this.handlerErrorResponse);
  }

  public async get<R>(url: string, request: HttpRequest = {}): Promise<R> {
    return this.axios
      .get<R>(url, {
        params: request.params,
        headers: request.headers,
      })
      .then((res) => res.data)
      .catch(this.handlerErrorResponse);
  }

  public async put<R>(url: string, request: HttpRequest = {}): Promise<R> {
    return this.axios
      .put<R>(url, request.body, {
        params: request.params,
        headers: request.headers,
      })
      .then((res) => res.data)
      .catch(this.handlerErrorResponse);
  }

  public async delete(url: string, request: HttpRequest = {}): Promise<void> {
    return this.axios
      .delete(url, {
        params: request.params,
        headers: request.headers,
      })
      .catch(this.handlerErrorResponse);
  }

  private handlerErrorResponse = (
    error: AxiosError<MessageResponse | ValidationsResponse>
  ): Promise<any> => {
    const res = error.response;
    log.error(error);

    if (res) {
      if (res.status == 400)
        return Promise.reject(new BadRequestError(res.data.message));
      if (res.status == 404) return Promise.reject(new ResourceNotFoundError());
      if (res.status == 401) return Promise.reject(new RequiredTokenError());
      if (res.status == 403) return Promise.reject(new AccessDeniedError());
      if (res.status == 422)
        return Promise.reject(new ServerValidationError(res.data));
    }
    return Promise.reject(new UnexpectedError());
  };
}
