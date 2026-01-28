export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface UseEmailVerifyParams {
  email: string;
  password?: string;
  nickname?: string;
}
