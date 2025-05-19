import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private readonly httpService: HttpService) {}

  async getWeather(city: string): Promise<WeatherResponseDto> {
    if (!city || typeof city !== 'string') {
      throw new BadRequestException('City name is required and must be a string');
    }

    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error('Weather API key is not configured in process.env');
      }

      const response = await firstValueFrom(
        this.httpService.get(this.BASE_URL, {
          params: {
            q: city,
            appid: apiKey,
            units: 'metric',
            lang: 'ua',
          },
        }),
      );

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
      };
    } catch (error) {
      this.handleWeatherError(error, city);
    }
  }

  private handleWeatherError(error: any, city: string): never {
    this.logger.error(`Weather API error for ${city}: ${error.message}`);

    if (error.response?.status === 404) {
      throw new NotFoundException(`City "${city}" not found`);
    }

    if (error.response?.status === 401) {
      throw new BadRequestException('Invalid Weather API key');
    }

    if (error.response?.status === 429) {
      throw new BadRequestException('Weather API request limit exceeded');
    }

    throw new BadRequestException('Failed to fetch weather data');
  }
}