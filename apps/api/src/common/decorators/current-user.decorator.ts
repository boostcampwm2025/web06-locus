import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@/jwt/jwt-payload.interface';

interface RequestWithAuthUser extends Request {
  user?: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuthUser>();

    const user = request.user;

    if (!user) return null;
    const userInfo = {
      ...user,
      sub: typeof user.sub === 'string' ? parseInt(user.sub, 10) : user.sub,
    };
    return data ? userInfo[data] : userInfo;
  },
);
