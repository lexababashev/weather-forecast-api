import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Frequency } from './dto/create-subscription.dto';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let prismaService: PrismaService;
  let weatherService: WeatherService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn(),
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

    service = module.get<SchedulerService>(SchedulerService);
    prismaService = module.get<PrismaService>(PrismaService);
    weatherService = module.get<WeatherService>(WeatherService);
    mailerService = module.get<MailerService>(MailerService);


    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleHourlyUpdates', () => {
    it('should send weather updates to hourly subscribers', async () => {
      const mockSubscriptions = [
        {
          id: '1',
          email: 'hourly@example.com',
          city: 'London',
          frequency: Frequency.HOURLY,
          token: 'token1',
          confirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockWeather = {
        temperature: 20.5,
        humidity: 65,
        description: 'clear sky',
      };

      jest
        .spyOn(prismaService.subscription, 'findMany')
        .mockResolvedValue(mockSubscriptions);
      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(mockWeather);
      jest
        .spyOn(service as any, 'sendWeatherUpdate')
        .mockResolvedValue(undefined);

      await service.handleHourlyUpdates();

      expect(prismaService.subscription.findMany).toHaveBeenCalledWith({
        where: {
          frequency: 'HOURLY',
          confirmed: true,
        },
      });

      expect(service['sendWeatherUpdate']).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'hourly@example.com',
          city: 'London',
          token: 'token1',
        }),
      );
    });

    it('should not send updates if no hourly subscriptions exist', async () => {
      jest.spyOn(prismaService.subscription, 'findMany').mockResolvedValue([]);
      jest.spyOn(service as any, 'sendWeatherUpdate');

      await service.handleHourlyUpdates();

      expect(service['sendWeatherUpdate']).not.toHaveBeenCalled();
    });
  });

  describe('handleDailyUpdates', () => {
    it('should send weather updates to daily subscribers', async () => {
      const mockSubscriptions = [
        {
          id: '2',
          email: 'daily@example.com',
          city: 'Berlin',
          frequency: Frequency.DAILY,
          token: 'token2',
          confirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockWeather = {
        temperature: 18.2,
        humidity: 70,
        description: 'cloudy',
      };

      jest
        .spyOn(prismaService.subscription, 'findMany')
        .mockResolvedValue(mockSubscriptions);
      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(mockWeather);
      jest
        .spyOn(service as any, 'sendWeatherUpdate')
        .mockResolvedValue(undefined);

      await service.handleDailyUpdates();

      expect(prismaService.subscription.findMany).toHaveBeenCalledWith({
        where: {
          frequency: 'DAILY',
          confirmed: true,
        },
      });

      expect(service['sendWeatherUpdate']).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'daily@example.com',
          city: 'Berlin',
          token: 'token2',
        }),
      );
    });

    it('should not send updates if no daily subscriptions exist', async () => {
      jest.spyOn(prismaService.subscription, 'findMany').mockResolvedValue([]);
      jest.spyOn(service as any, 'sendWeatherUpdate');

      await service.handleDailyUpdates();

      expect(service['sendWeatherUpdate']).not.toHaveBeenCalled();
    });
  });

  describe('sendWeatherUpdate', () => {
    it('should handle errors gracefully when getting weather fails', async () => {
      const subscription = {
        email: 'test@example.com',
        city: 'ErrorCity',
        token: 'token123',
      };

      jest
        .spyOn(weatherService, 'getWeather')
        .mockRejectedValue(new Error('Weather API error'));

      await (service as any).sendWeatherUpdate(subscription);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('startScheduler', () => {
    it('should log a message when scheduler starts', () => {
      service.startScheduler();
      expect(console.log).toHaveBeenCalledWith(
        'Weather update scheduler started',
      );
    });
  });
});
