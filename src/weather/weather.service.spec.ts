import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);

    // Mock environment variables
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      const mockResponse = {
        data: {
          main: {
            temp: 20.5,
            humidity: 65,
          },
          weather: [
            {
              description: 'clear sky',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service.getWeather('London');

      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'London',
            appid: 'test-api-key',
          }),
        }),
      );

      expect(result).toEqual({
        temperature: 20.5,
        humidity: 65,
        description: 'clear sky',
      });
    });

    it('should throw BadRequestException when city is not provided', async () => {
      await expect(service.getWeather('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when city is not found', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 404 },
          message: 'City not found',
        })),
      );

      await expect(service.getWeather('NonExistentCity')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when API key is invalid', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 401 },
          message: 'Invalid API key',
        })),
      );

      await expect(service.getWeather('London')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when API request limit is exceeded', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 429 },
          message: 'Rate limit exceeded',
        })),
      );

      await expect(service.getWeather('London')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 500 },
          message: 'Server error',
        })),
      );

      await expect(service.getWeather('London')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error when API key is not configured', async () => {
      process.env.OPENWEATHER_API_KEY = '';

      await expect(service.getWeather('London')).rejects.toThrow(
        'Weather API key is not configured in process.env',
      );
    });
  });
});
