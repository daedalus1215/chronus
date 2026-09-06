import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';
import { UserRepository } from '../../infra/repositories/user.repository';
import { RegisterUserTransactionScript } from '../transaction-scripts/register-user-TS/register-user.transaction.script';
import { UpdateUsernameTransactionScript } from '../transaction-scripts/update-username-TS/update-username.transaction.script';
import { UpdatePasswordTransactionScript } from '../transaction-scripts/update-password-TS/update-password.transaction.script';
import { SecurityEventAggregator } from '../../../security-events/domain/aggregators/security-event.aggregator';

describe('UsersService', () => {
  let target: UsersService;
  let configServiceMock: { get: jest.Mock };
  let securityEventAggregatorMock: {
    logDisabledRegistrationAttempt: jest.Mock;
  };
  let registerUserTSMock: { apply: jest.Mock };

  const context = { ip: '127.0.0.1', userAgent: 'test-agent' };

  beforeEach(async () => {
    configServiceMock = { get: jest.fn() };
    securityEventAggregatorMock = { logDisabledRegistrationAttempt: jest.fn() };
    registerUserTSMock = { apply: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: RegisterUserTransactionScript,
          useValue: registerUserTSMock,
        },
        {
          provide: UpdateUsernameTransactionScript,
          useValue: { apply: jest.fn() },
        },
        {
          provide: UpdatePasswordTransactionScript,
          useValue: { apply: jest.fn() },
        },
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: SecurityEventAggregator,
          useValue: securityEventAggregatorMock,
        },
      ],
    }).compile();

    target = module.get<UsersService>(UsersService);

    // Mimic ConfigService: return the env value when set, else the fallback
    configServiceMock.get.mockImplementation(
      (key: string, fallback?: string) =>
        key === 'ALLOW_REGISTRATION'
          ? (process.env.ALLOW_REGISTRATION ?? fallback)
          : fallback
    );
  });

  afterEach(() => {
    delete process.env.ALLOW_REGISTRATION;
    // NODE_ENV is restored by the individual tests that change it
  });

  describe('register', () => {
    const command = { username: 'newuser@example.com', password: 'secret123' };

    it('should reject with 403 and log a security event when registration is disabled by default in production', async () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      securityEventAggregatorMock.logDisabledRegistrationAttempt.mockResolvedValue(
        undefined
      );
      try {
        // Act / Assert
        await expect(target.register(command, context)).rejects.toThrow(
          ForbiddenException
        );
        expect(
          securityEventAggregatorMock.logDisabledRegistrationAttempt
        ).toHaveBeenCalledWith(context);
        expect(registerUserTSMock.apply).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it('should reject with 403 and log a security event when ALLOW_REGISTRATION is explicitly false', async () => {
      // Arrange
      process.env.ALLOW_REGISTRATION = 'false';
      securityEventAggregatorMock.logDisabledRegistrationAttempt.mockResolvedValue(
        undefined
      );

      // Act / Assert
      await expect(target.register(command, context)).rejects.toThrow(
        ForbiddenException
      );
      expect(
        securityEventAggregatorMock.logDisabledRegistrationAttempt
      ).toHaveBeenCalledWith(context);
      expect(registerUserTSMock.apply).not.toHaveBeenCalled();
    });

    it('should delegate to the transaction script when registration is enabled', async () => {
      // Arrange
      process.env.ALLOW_REGISTRATION = 'true';
      const projection = {
        id: 1,
        username: command.username,
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T09:00:00Z'),
      };
      registerUserTSMock.apply.mockResolvedValue(projection);

      // Act
      const result = await target.register(command, context);

      // Assert
      expect(registerUserTSMock.apply).toHaveBeenCalledWith(command);
      expect(
        securityEventAggregatorMock.logDisabledRegistrationAttempt
      ).not.toHaveBeenCalled();
      expect(result).toEqual(projection);
    });

    it('should allow registration by default when NODE_ENV is not production and no env override is set', async () => {
      // Arrange (jest runs with NODE_ENV=test -> default is 'true')
      const projection = {
        id: 2,
        username: command.username,
        createdAt: new Date('2024-01-15T09:00:00Z'),
        updatedAt: new Date('2024-01-15T09:00:00Z'),
      };
      registerUserTSMock.apply.mockResolvedValue(projection);

      // Act
      const result = await target.register(command, context);

      // Assert
      expect(registerUserTSMock.apply).toHaveBeenCalledWith(command);
      expect(result).toEqual(projection);
    });

    it('should propagate transaction script rejections', async () => {
      // Arrange
      process.env.ALLOW_REGISTRATION = 'true';
      registerUserTSMock.apply.mockRejectedValue(
        new ConflictException('Username already exists')
      );

      // Act / Assert
      await expect(target.register(command, context)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
