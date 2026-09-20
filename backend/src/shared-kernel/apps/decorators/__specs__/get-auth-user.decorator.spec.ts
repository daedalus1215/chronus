import { ExecutionContext } from '@nestjs/common';
import { AuthUser, GetAuthUser } from '../get-auth-user.decorator';

describe('GetAuthUser', () => {
  const user: AuthUser = { userId: 7, username: 'jane.doe' };

  const createFakeCtx = (requestUser?: AuthUser) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: requestUser }),
      }),
    }) as unknown as ExecutionContext;

  type ParamEntry = {
    index: number;
    data: keyof AuthUser | undefined;
    factory: (
      data: keyof AuthUser | undefined,
      ctx: ExecutionContext
    ) => unknown;
    pipes: unknown[];
  };

  // The decorator only registers itself; NestJS stores the factory (and its
  // data argument) under the '__routeArguments__' metadata key and invokes it
  // with that stored data. This resolves the stored entry the same way the
  // runtime does, so the real factory is exercised.
  const resolveParam = (data?: keyof AuthUser): ParamEntry => {
    class FakeController {}
    GetAuthUser(data)(FakeController.prototype, 'handle', 0);
    const metadata = Reflect.getMetadata(
      '__routeArguments__',
      FakeController,
      'handle'
    );
    const [entry] = Object.values(metadata) as ParamEntry[];
    return entry;
  };

  it('returns the full request.user object without a key', () => {
    const param = resolveParam();
    expect(param.factory(param.data, createFakeCtx(user))).toEqual(user);
  });

  it('returns user.userId for the userId key', () => {
    const param = resolveParam('userId');
    expect(param.factory(param.data, createFakeCtx(user))).toBe(7);
  });

  it('returns user.username for the username key', () => {
    const param = resolveParam('username');
    expect(param.factory(param.data, createFakeCtx(user))).toBe('jane.doe');
  });

  it('returns undefined without a key when request.user is missing', () => {
    const param = resolveParam();
    expect(param.factory(param.data, createFakeCtx())).toBeUndefined();
  });

  it('returns undefined with a key when request.user is missing', () => {
    const param = resolveParam('userId');
    expect(param.factory(param.data, createFakeCtx())).toBeUndefined();
  });
});
