import { AuthInfo } from "../models";
import { TokenPayload, TokenResponse } from "@/data/models";
import { HttpClient } from "@/data/http/http-client";
import { Credentials } from "../params";

export class AuthService {
  constructor(private readonly httpClient: HttpClient) {}

  login = async ({
    username,
    password,
    remember_me,
  }: Credentials): Promise<AuthInfo> => {
    const basic_credentails = `Basic ${btoa(username + ":" + password)}`;

    const token_response = await this.httpClient.post<TokenResponse>(`signin`, {
      params: { remember_me },
      headers: { authorization: basic_credentails },
    });

    return this.toAuthInfo(token_response);
  };

  refreshToken = async (access_token: string): Promise<AuthInfo> => {
    const token_response = await this.httpClient.get<TokenResponse>(
      "/refresh-token",
      {
        headers: { authorization: `Bearer ${access_token}` },
      }
    );

    return this.toAuthInfo(token_response);
  };

  restoreSession = async (session_token: string): Promise<AuthInfo> => {
    const token_response = await this.httpClient.get<TokenResponse>(
      "restore-session",
      {
        headers: { authorization: `Bearer ${session_token}` },
      }
    );

    return this.toAuthInfo(token_response);
  };

  private toAuthInfo = (token_response: TokenResponse): AuthInfo => {
    const access_token = token_response.access_token;

    const token_payload: TokenPayload = JSON.parse(
      atob(access_token.split(".")[1])
    );

    return {
      current_user: {
        id: token_payload.id,
        name: token_payload.name,
        username: token_payload.username,
        email: token_payload.email,
        admin: token_payload.admin,
      },
      tokens: { ...token_response, exp_access_token: token_payload.exp },
    };
  };
}
