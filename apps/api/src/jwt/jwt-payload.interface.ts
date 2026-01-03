import { Provider } from '@prisma/client';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  provider: Provider;
  iat?: number;
  exp?: number;
}
