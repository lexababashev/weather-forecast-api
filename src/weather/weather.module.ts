import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}