import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ConflictException } from '@nestjs/common';

enum Frequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
}

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: SubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: {
            subscribe: jest.fn(),
            confirm: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should subscribe user and return confirmation message', async () => {
      const createDto: CreateSubscriptionDto = {
        email: 'test@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
      };

      const expectedResult = { message: 'Confirmation email sent' };

      jest
        .spyOn(subscriptionService, 'subscribe')
        .mockResolvedValue(expectedResult);

      const result = await controller.subscribe(createDto);

      expect(subscriptionService.subscribe).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException for already subscribed email', async () => {
      const createDto: CreateSubscriptionDto = {
        email: 'existing@example.com',
        city: 'London',
        frequency: Frequency.DAILY,
      };

      jest.spyOn(subscriptionService, 'subscribe').mockImplementation(() => {
        throw new ConflictException('Email already subscribed');
      });

      await expect(controller.subscribe(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription', async () => {
      const token = 'valid-token';
      const expectedResult = {
        success: true,
        message: 'Subscription confirmed',
      };

      jest
        .spyOn(subscriptionService, 'confirm')
        .mockResolvedValue(expectedResult);

      const result = await controller.confirm(token);

      expect(subscriptionService.confirm).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should return failure message for invalid token', async () => {
      const token = 'invalid-token';
      const expectedResult = {
        success: false,
        message: 'Invalid token',
      };

      jest
        .spyOn(subscriptionService, 'confirm')
        .mockResolvedValue(expectedResult);

      const result = await controller.confirm(token);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe a user', async () => {
      const token = 'valid-token';
      const expectedResult = {
        success: true,
        message: 'Unsubscribed successfully',
      };

      jest
        .spyOn(subscriptionService, 'unsubscribe')
        .mockResolvedValue(expectedResult);

      const result = await controller.unsubscribe(token);

      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should return failure message for invalid token', async () => {
      const token = 'invalid-token';
      const expectedResult = {
        success: false,
        message: 'Invalid token',
      };

      jest
        .spyOn(subscriptionService, 'unsubscribe')
        .mockResolvedValue(expectedResult);

      const result = await controller.unsubscribe(token);

      expect(result).toEqual(expectedResult);
    });
  });
});
