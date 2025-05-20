import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { BadRequestException } from '@nestjs/common';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      const expectedResult = {
        temperature: 20.5,
        humidity: 65,
        description: 'clear sky',
      };

      jest
        .spyOn(weatherService, 'getWeather')
        .mockResolvedValue(expectedResult);

      const result = await controller.getWeather({ city: 'London' });

      expect(weatherService.getWeather).toHaveBeenCalledWith('London');
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when city is not provided', async () => {
      jest.spyOn(weatherService, 'getWeather').mockImplementation(() => {
        throw new BadRequestException(
          'City name is required and must be a string',
        );
      });

      await expect(controller.getWeather({ city: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
