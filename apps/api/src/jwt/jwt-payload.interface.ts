import { Provider } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  provider: Provider;
  iat?: number;
  exp?: number;
}
