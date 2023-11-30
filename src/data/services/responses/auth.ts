export type TokenResponse = {
  access_token: string;
  session_token?: string;
};

export type TokenPayload = {
  id: number;
  name: string;
  username: string;
  email: string;
  admin: boolean;
  exp: number;
};
