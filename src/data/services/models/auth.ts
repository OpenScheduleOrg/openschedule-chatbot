export type CurrentUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  admin: boolean;
};

export type AuthInfo = {
  current_user: CurrentUser;
  tokens: {
    exp_access_token: number;
    access_token: string;
    session_token?: string;
  };
};
