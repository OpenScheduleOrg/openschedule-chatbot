import { CurrentUser } from "@/domain/models";
import { AuthService } from "@/domain/services";

export class CredentialManager {
  private user: CurrentUser;
  private access_token: string;
  private exp: number = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly session_token: string
  ) {}

  async getAccessToken(): Promise<string> {
    if (!this.user || this.exp - 600000 < Date.now()) {
      try {
        await this.updateCredentials();
      } catch (err) {
        console.warn("Could not get new token");
        console.error(err);
      }
    }

    return this.access_token;
  }
  private async updateCredentials() {
    const auth_info = await this.authService.restoreSession(this.session_token);
    this.user = auth_info.current_user;
    this.access_token = auth_info.tokens.access_token;
    this.exp = auth_info.tokens.exp_access_token * 1000;
  }
}
