import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Frequency } from './dto/create-subscription.dto';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prismaService: PrismaService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailerService = module.get<MailerService>(MailerService);


    jest
      .spyOn(service as any, 'generateRandomToken')
      .mockReturnValue('test-token-1234');

    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a new subscription when email is not registered', async () => {
      const createDto: CreateSubscriptionDto = {
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
      };

      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(null);
      jest.spyOn(prismaService.subscription, 'create').mockResolvedValue({
        id: '1',
        email: createDto.email,
        city: createDto.city,
        frequency: createDto.frequency,
        token: 'test-token-1234',
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.subscribe(createDto);

      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });

      expect(prismaService.subscription.create).toHaveBeenCalledWith({
        data: {
          email: createDto.email,
          city: createDto.city,
          frequency: createDto.frequency,
          token: 'test-token-1234',
        },
      });

      expect(result).toEqual({ message: 'Confirmation email sent' });
    });

    it('should throw conflict exception when email already exists', async () => {
      const createDto: CreateSubscriptionDto = {
        email: 'existing@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
      };
      jest.spyOn(prismaService.subscription, 'findUnique').mockResolvedValue({
        id: '1',
        email: createDto.email,
        city: createDto.city,
        frequency: createDto.frequency,
        token: 'existing-token',
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.subscribe(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription with valid token', async () => {
      const mockSubscription = {
        id: '1',
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
        token: 'valid-token',
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(prismaService.subscription, 'update').mockResolvedValue({
        ...mockSubscription,
        confirmed: true,
      });

      const result = await service.confirm('valid-token');

      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
      });

      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        data: { confirmed: true },
      });

      expect(result).toEqual({
        success: true,
        message: 'Subscription confirmed',
      });
    });

    it('should return success: false for invalid token', async () => {
      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.confirm('invalid-token');

      expect(result).toEqual({
        success: false,
        message: 'Invalid token',
      });
    });
    it('should return already confirmed message if already confirmed', async () => {
      const mockSubscription = {
        id: '1',
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
        token: 'valid-token',
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(mockSubscription);

      const result = await service.confirm('valid-token');

      expect(prismaService.subscription.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Already confirmed',
      });
    });
  });
  describe('unsubscribe', () => {
    it('should unsubscribe with valid token', async () => {
      const mockSubscription = {
        id: '1',
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
        token: 'valid-token',
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(prismaService.subscription, 'delete')
        .mockResolvedValue(mockSubscription);

      const result = await service.unsubscribe('valid-token');

      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
      });

      expect(prismaService.subscription.delete).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
      });

      expect(result).toEqual({
        success: true,
        message: 'Unsubscribed successfully',
      });
    });

    it('should return success: false for invalid token', async () => {
      jest
        .spyOn(prismaService.subscription, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.unsubscribe('invalid-token');

      expect(result).toEqual({
        success: false,
        message: 'Invalid token',
      });
    });
  });
});
