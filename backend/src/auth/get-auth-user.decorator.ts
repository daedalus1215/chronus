import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type User = {
  userId: string;
  username: string;
};

export const GetAuthUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
); 