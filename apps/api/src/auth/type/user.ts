export interface PendingUser {
  email: string;
  hashedPassword: string;
  nickname?: string;
  code: string;
  retryCount: number;
}
