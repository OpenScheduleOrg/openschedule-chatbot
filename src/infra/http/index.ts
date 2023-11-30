import { HttpClient } from "./http-client";
import { AuthorizeHttpClient } from "./authorize-http-client";

export const httpAuthClient = new HttpClient(process.env.VUE_APP_AUTH_URI);
export const httpClient = new AuthorizeHttpClient(
  process.env.VUE_APP_API_URI,
  undefined
);
